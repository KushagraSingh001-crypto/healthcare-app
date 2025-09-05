import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Appointment } from '../models/appointment.model.js'
import { User } from '../models/user.model.js'
import { Doctor } from '../models/doctor.model.js'
import { Patient } from '../models/patient.model.js'
import mongoose from 'mongoose'
import { 
  sendAppointmentBookedEmail, 
  sendAppointmentConfirmedEmail, 
  sendAppointmentCancelledEmail,
  sendAppointmentRejectedEmail 
} from '../utils/emailService.js'

export const getUserAppointments = asyncHandler(async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'fullName email')
      .sort({ appointmentDate: 1, appointmentTime: 1 })

    const formattedAppointments = await Promise.all(appointments.map(async (appointment) => {
      const doctorUser = appointment.doctorId
      const doctor = await Doctor.findOne({ userId: doctorUser._id }).select('speciality')

      return {
        id: appointment._id,
        doctorName: doctorUser.fullName,
        doctorEmail: doctorUser.email,
        specialty: doctor?.speciality || 'Unknown',
        date: appointment.appointmentDate,
        time: appointment.appointmentTime,
        type: appointment.appointmentType,
        reason: appointment.reason,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.createdAt
      }
    }))

    return res.status(200).json(
      new ApiResponse(200, formattedAppointments, "Appointments retrieved successfully")
    )
  } catch (error) {
    console.error('Error fetching appointments:', error)
    throw new ApiError(500, "Failed to retrieve appointments")
  }
})

export const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, appointmentDate, appointmentTime, appointmentType, reason } = req.body

  console.log('Booking request data:', { doctorId, appointmentDate, appointmentTime, appointmentType, reason })

  if (!doctorId || !appointmentDate || !appointmentTime || !appointmentType || !reason) {
    throw new ApiError(400, "All fields are required")
  }

  
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new ApiError(400, "Invalid doctor ID format")
  }

  
  let doctor = await Doctor.findById(doctorId).populate('userId', 'fullName email speciality')
  
  
  if (!doctor) {
    doctor = await Doctor.findOne({ userId: doctorId }).populate('userId', 'fullName email speciality')
  }

  
  if (!doctor) {
    const user = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true })
    if (user) {
      doctor = await Doctor.findOne({ userId: doctorId }).populate('userId', 'fullName email speciality')
    }
  }

  if (!doctor || !doctor.userId) {
    console.log('Doctor not found with ID:', doctorId)
    throw new ApiError(404, "Doctor not found or inactive")
  }

  console.log('Found doctor:', {
    doctorDbId: doctor._id,
    userId: doctor.userId._id,
    name: doctor.userId.fullName
  })

  
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)
  if (appointmentDateTime <= new Date()) {
    throw new ApiError(400, "Appointment time must be in the future")
  }

  
  const existingAppointment = await Appointment.findOne({
    patientId: req.user._id,
    doctorId: doctor.userId._id, 
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: { $in: ['pending', 'confirmed'] }
  })

  if (existingAppointment) {
    throw new ApiError(400, "You already have an appointment with this doctor at this time")
  }

  
  const conflictingAppointment = await Appointment.findOne({
    doctorId: doctor.userId._id, 
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: { $in: ['pending', 'confirmed'] }
  })

  if (conflictingAppointment) {
    throw new ApiError(400, "This time slot is already booked")
  }

  try {
    
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId: doctor.userId._id, 
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      appointmentType,
      reason: reason.trim(),
      status: 'pending'
    })

    console.log('Created appointment:', appointment)

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'fullName email')

    try {
      await sendAppointmentBookedEmail(
        req.user.email,
        req.user.fullName,
        doctor.userId.fullName,
        appointmentDate,
        appointmentTime
      )
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
    }

    const doctorDoc = await Doctor.findOne({ userId: doctor.userId._id }).select('speciality')

    const formattedAppointment = {
      id: populatedAppointment._id,
      doctorName: doctor.userId.fullName,
      doctorEmail: doctor.userId.email,
      specialty: doctorDoc?.speciality || 'Unknown',
      date: populatedAppointment.appointmentDate,
      time: populatedAppointment.appointmentTime,
      type: populatedAppointment.appointmentType,
      reason: populatedAppointment.reason,
      status: populatedAppointment.status,
      createdAt: populatedAppointment.createdAt
    }

    return res.status(201).json(
      new ApiResponse(201, formattedAppointment, "Appointment booked successfully")
    )
  } catch (error) {
    console.error('Error booking appointment:', error)
    throw new ApiError(500, "Failed to book appointment")
  }
})

export const editAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { appointmentDate, appointmentTime, appointmentType, reason } = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid appointment ID")
  }

  const appointment = await Appointment.findOne({
    _id: id,
    patientId: req.user._id
  }).populate('doctorId', 'fullName email')

  if (!appointment) {
    throw new ApiError(404, "Appointment not found")
  }

  if (appointment.status !== 'pending') {
    throw new ApiError(400, "Only pending appointments can be edited")
  }

  if (appointmentDate && appointmentTime) {
    const newAppointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)
    if (newAppointmentDateTime <= new Date()) {
      throw new ApiError(400, "Appointment time must be in the future")
    }

    if (appointmentDate !== appointment.appointmentDate.toISOString().split('T')[0] || 
        appointmentTime !== appointment.appointmentTime) {
      
      const conflictingAppointment = await Appointment.findOne({
        doctorId: appointment.doctorId._id,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        status: { $in: ['pending', 'confirmed'] },
        _id: { $ne: id }
      })

      if (conflictingAppointment) {
        throw new ApiError(400, "This time slot is already booked")
      }
    }
  }

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        ...(appointmentDate && { appointmentDate: new Date(appointmentDate) }),
        ...(appointmentTime && { appointmentTime }),
        ...(appointmentType && { appointmentType }),
        ...(reason && { reason: reason.trim() })
      },
      { new: true }
    ).populate('doctorId', 'fullName email')

    const doctor = await Doctor.findOne({ userId: updatedAppointment.doctorId._id }).select('speciality')

    const formattedAppointment = {
      id: updatedAppointment._id,
      doctorName: updatedAppointment.doctorId.fullName,
      doctorEmail: updatedAppointment.doctorId.email,
      specialty: doctor?.speciality || 'Unknown',
      date: updatedAppointment.appointmentDate,
      time: updatedAppointment.appointmentTime,
      type: updatedAppointment.appointmentType,
      reason: updatedAppointment.reason,
      status: updatedAppointment.status,
      notes: updatedAppointment.notes,
      updatedAt: updatedAppointment.updatedAt
    }

    return res.status(200).json(
      new ApiResponse(200, formattedAppointment, "Appointment updated successfully")
    )
  } catch (error) {
    console.error('Error updating appointment:', error)
    throw new ApiError(500, "Failed to update appointment")
  }
})

export const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid appointment ID")
  }

  const appointment = await Appointment.findOne({
    _id: id,
    patientId: req.user._id
  }).populate('doctorId', 'fullName email speciality')

  if (!appointment) {
    throw new ApiError(404, "Appointment not found")
  }

  if (!['pending', 'confirmed'].includes(appointment.status)) {
    throw new ApiError(400, "This appointment cannot be cancelled")
  }

  try {
    await Appointment.findByIdAndUpdate(id, { 
      status: 'cancelled',
      'notes.patientNotes': 'Cancelled by patient'
    })

    try {
      await sendAppointmentCancelledEmail(
        req.user.email,
        req.user.fullName,
        appointment.doctorId.fullName,
        appointment.appointmentDate,
        appointment.appointmentTime,
        'Patient'
      )
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
    }

    return res.status(200).json(
      new ApiResponse(200, null, "Appointment cancelled successfully")
    )
  } catch (error) {
    console.error('Error cancelling appointment:', error)
    throw new ApiError(500, "Failed to cancel appointment")
  }
})

export const getDoctorAppointments = asyncHandler(async (req, res) => {
  const { status, date, page = 1, limit = 10 } = req.query

  try {
    const filter = { doctorId: req.user._id }
    
    if (status && ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'].includes(status)) {
      filter.status = status
    }

    if (date) {
      const queryDate = new Date(date)
      filter.appointmentDate = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lte: new Date(queryDate.setHours(23, 59, 59, 999))
      }
    }

    const skip = (page - 1) * limit
    
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'fullName email phone')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(parseInt(limit))

    const totalAppointments = await Appointment.countDocuments(filter)

    const formattedAppointments = appointments.map(appointment => ({
      id: appointment._id,
      patientName: appointment.patientId.fullName,
      patientEmail: appointment.patientId.email,
      patientPhone: appointment.patientId.phone,
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
      type: appointment.appointmentType,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes,
      isUrgent: appointment.isUrgent,
      createdAt: appointment.createdAt
    }))

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalAppointments / limit),
      totalAppointments,
      hasNext: page < Math.ceil(totalAppointments / limit),
      hasPrev: page > 1
    }

    return res.status(200).json(
      new ApiResponse(200, { appointments: formattedAppointments, pagination }, "Appointments retrieved successfully")
    )
  } catch (error) {
    console.error('Error fetching doctor appointments:', error)
    throw new ApiError(500, "Failed to retrieve appointments")
  }
})

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, doctorNotes } = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid appointment ID")
  }

  if (!['confirmed', 'rejected', 'completed', 'cancelled'].includes(status)) {
    throw new ApiError(400, "Invalid status. Must be: confirmed, rejected, completed, or cancelled")
  }

  const appointment = await Appointment.findOne({
    _id: id,
    doctorId: req.user._id
  }).populate('patientId', 'fullName email')

  if (!appointment) {
    throw new ApiError(404, "Appointment not found")
  }

  
  if (status === 'confirmed' && appointment.status !== 'pending') {
    throw new ApiError(400, "Only pending appointments can be confirmed")
  }

  if (status === 'rejected' && appointment.status !== 'pending') {
    throw new ApiError(400, "Only pending appointments can be rejected")
  }

  if (status === 'completed' && appointment.status !== 'confirmed') {
    throw new ApiError(400, "Only confirmed appointments can be marked as completed")
  }

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status,
        ...(doctorNotes && { 'notes.doctorNotes': doctorNotes.trim() })
      },
      { new: true }
    ).populate('patientId', 'fullName email')

    
    try {
      const patient = updatedAppointment.patientId
      const doctorName = req.user.fullName

      switch (status) {
        case 'confirmed':
          await sendAppointmentConfirmedEmail(
            patient.email,
            patient.fullName,
            doctorName,
            updatedAppointment.appointmentDate,
            updatedAppointment.appointmentTime
          )
          break
        
        case 'rejected':
          await sendAppointmentRejectedEmail(
            patient.email,
            patient.fullName,
            doctorName,
            updatedAppointment.appointmentDate,
            updatedAppointment.appointmentTime
          )
          break
        
        case 'cancelled':
          await sendAppointmentCancelledEmail(
            patient.email,
            patient.fullName,
            doctorName,
            updatedAppointment.appointmentDate,
            updatedAppointment.appointmentTime,
            'Doctor'
          )
          break
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
    }

    const formattedAppointment = {
      id: updatedAppointment._id,
      patientName: updatedAppointment.patientId.fullName,
      patientEmail: updatedAppointment.patientId.email,
      date: updatedAppointment.appointmentDate,
      time: updatedAppointment.appointmentTime,
      type: updatedAppointment.appointmentType,
      reason: updatedAppointment.reason,
      status: updatedAppointment.status,
      notes: updatedAppointment.notes,
      updatedAt: updatedAppointment.updatedAt
    }

    return res.status(200).json(
      new ApiResponse(200, formattedAppointment, `Appointment ${status} successfully`)
    )
  } catch (error) {
    console.error('Error updating appointment status:', error)
    throw new ApiError(500, "Failed to update appointment status")
  }
})