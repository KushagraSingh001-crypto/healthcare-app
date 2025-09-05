import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Doctor } from '../models/doctor.model.js'
import { User } from '../models/user.model.js'
import { Appointment } from '../models/appointment.model.js'
import mongoose from 'mongoose'

const getAllDoctors = asyncHandler(async (req, res) => {
    const { specialty, name } = req.query
    
    console.log('Getting all doctors with filters:', { specialty, name })
    
    let query = {}
    if (specialty && specialty !== 'all') {
        query.speciality = { $regex: specialty, $options: 'i' }
    }
    
    try {
        const doctors = await Doctor.find(query).populate('userId', 'fullName email phone profilePicture')
        
        console.log('Found doctors:', doctors.length)
        
        let filteredDoctors = doctors
        if (name) {
            filteredDoctors = doctors.filter(doctor => {
                const doctorName = doctor.userId?.fullName || ''
                return doctorName.toLowerCase().includes(name.toLowerCase())
            })
        }
        
        
        const formattedDoctors = filteredDoctors.map(doctor => ({
            _id: doctor._id,
            userId: {
                _id: doctor.userId._id,
                fullName: doctor.userId.fullName,
                email: doctor.userId.email,
                phone: doctor.userId.phone,
                profilePicture: doctor.userId.profilePicture
            },
            speciality: doctor.speciality,
            otherSpeciality: doctor.otherSpeciality,
            yearsOfExperience: doctor.yearsOfExperience,
            licenseNumber: doctor.licenseNumber,
            education: doctor.education,
            clinicInfo: doctor.clinicInfo,
            bio: doctor.bio,
            rating: doctor.rating,
            totalReviews: doctor.totalReviews,
            availability: doctor.availability,
            isVerified: doctor.isVerified,
            createdAt: doctor.createdAt,
            updatedAt: doctor.updatedAt
        }))
        
        return res.status(200).json(
            new ApiResponse(200, formattedDoctors, "Doctors fetched successfully")
        )
    } catch (error) {
        console.error('Error fetching doctors:', error)
        throw new ApiError(500, "Failed to fetch doctors")
    }
})

const getDoctorById = asyncHandler(async (req, res) => {
    const { id } = req.params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid doctor ID")
    }
    
    try {
        
        let doctor = await Doctor.findById(id).populate('userId', 'fullName email phone profilePicture')
        
        
        if (!doctor) {
            doctor = await Doctor.findOne({ userId: id }).populate('userId', 'fullName email phone profilePicture')
        }
        
        if (!doctor) {
            throw new ApiError(404, "Doctor not found")
        }
        
        const formattedDoctor = {
            _id: doctor._id,
            userId: {
                _id: doctor.userId._id,
                fullName: doctor.userId.fullName,
                email: doctor.userId.email,
                phone: doctor.userId.phone,
                profilePicture: doctor.userId.profilePicture
            },
            speciality: doctor.speciality,
            otherSpeciality: doctor.otherSpeciality,
            yearsOfExperience: doctor.yearsOfExperience,
            licenseNumber: doctor.licenseNumber,
            education: doctor.education,
            clinicInfo: doctor.clinicInfo,
            bio: doctor.bio,
            rating: doctor.rating,
            totalReviews: doctor.totalReviews,
            availability: doctor.availability,
            isVerified: doctor.isVerified,
            createdAt: doctor.createdAt,
            updatedAt: doctor.updatedAt
        }
        
        return res.status(200).json(
            new ApiResponse(200, formattedDoctor, "Doctor details fetched successfully")
        )
    } catch (error) {
        console.error('Error fetching doctor by ID:', error)
        throw new ApiError(500, "Failed to fetch doctor details")
    }
})

const getDoctorAvailability = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { date } = req.query
    
    console.log('Getting availability for doctor ID:', id, 'date:', date)
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid doctor ID")
    }
    
    try {
        
        let doctor = await Doctor.findById(id).select('availability')
        
        
        if (!doctor) {
            doctor = await Doctor.findOne({ userId: id }).select('availability')
        }
        
        if (!doctor) {
            throw new ApiError(404, "Doctor not found")
        }
        
        
        const defaultAvailability = [
            { day: 'Monday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
            { day: 'Tuesday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
            { day: 'Wednesday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
            { day: 'Thursday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
            { day: 'Friday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
            { day: 'Saturday', isAvailable: false, startTime: null, endTime: null },
            { day: 'Sunday', isAvailable: false, startTime: null, endTime: null }
        ]
        
        const availability = doctor.availability || defaultAvailability
        
        if (date) {
            const appointmentDate = new Date(date)
            const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0))
            const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999))
            
            
            const doctorUserId = doctor.userId || id
            
            const existingAppointments = await Appointment.find({
                doctorId: doctorUserId,
                appointmentDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $in: ['pending', 'confirmed'] }
            }).select('appointmentTime')
            
            const bookedTimes = existingAppointments.map(apt => apt.appointmentTime)
            
            return res.status(200).json(
                new ApiResponse(200, {
                    availability: availability,
                    bookedTimes,
                    date: appointmentDate.toISOString().split('T')[0]
                }, "Doctor availability fetched successfully")
            )
        }
        
        return res.status(200).json(
            new ApiResponse(200, { availability: availability }, "Doctor availability fetched successfully")
        )
    } catch (error) {
        console.error('Error fetching doctor availability:', error)
        throw new ApiError(500, "Failed to fetch doctor availability")
    }
})

const getDoctorProfile = asyncHandler(async (req, res) => {
    console.log("Getting doctor profile...")
    console.log("req.user:", req.user)
    
    if (!req.user) {
        throw new ApiError(401, "User not authenticated")
    }
    
    const doctorId = req.user._id
    console.log("Doctor ID from token:", doctorId)
    
    try {
        
        const user = await User.findById(doctorId).select('-password -refreshToken')
        console.log("User found:", user ? "Yes" : "No")
        
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        
        
        const doctor = await Doctor.findOne({ userId: doctorId })
        console.log("Doctor found:", doctor ? "Yes" : "No")
        
        if (!doctor) {
            throw new ApiError(404, "Doctor profile not found")
        }
        
        
        const profile = {
            _id: doctor._id,
            userId: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            profilePicture: user.profilePicture,
            speciality: doctor.speciality,
            otherSpeciality: doctor.otherSpeciality,
            yearsOfExperience: doctor.yearsOfExperience,
            licenseNumber: doctor.licenseNumber,
            education: doctor.education,
            clinicInfo: doctor.clinicInfo,
            bio: doctor.bio,
            rating: doctor.rating,
            totalReviews: doctor.totalReviews,
            availability: doctor.availability,
            isVerified: doctor.isVerified,
            createdAt: doctor.createdAt,
            updatedAt: doctor.updatedAt
        }
        
        return res.status(200).json(
            new ApiResponse(200, profile, "Doctor profile fetched successfully")
        )
    } catch (error) {
        console.error('Error fetching doctor profile:', error)
        throw new ApiError(500, "Failed to fetch doctor profile")
    }
})

const updateDoctorProfile = asyncHandler(async (req, res) => {
    const doctorId = req.user._id
    const {
        fullName,
        email,
        phone,
        speciality,
        otherSpeciality,
        yearsOfExperience,
        licenseNumber,
        education,
        clinicInfo,
        bio,
        availability
    } = req.body
    
    try {
        
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: doctorId } })
            if (existingUser) {
                throw new ApiError(409, "Email already exists")
            }
        }
        
        
        const userUpdateData = {}
        if (fullName) userUpdateData.fullName = fullName
        if (email) userUpdateData.email = email
        if (phone) userUpdateData.phone = phone
        
        let updatedUser = await User.findById(doctorId).select('-password -refreshToken')
        if (Object.keys(userUpdateData).length > 0) {
            updatedUser = await User.findByIdAndUpdate(doctorId, userUpdateData, { new: true }).select('-password -refreshToken')
        }
        if (!updatedUser) {
            throw new ApiError(404, "User not found")
        }
        
        
        const doctorUpdateData = {}
        if (speciality) doctorUpdateData.speciality = speciality
        if (speciality === 'Other' && otherSpeciality) {
            doctorUpdateData.otherSpeciality = otherSpeciality
        }
        if (yearsOfExperience !== undefined) doctorUpdateData.yearsOfExperience = yearsOfExperience
        if (licenseNumber) doctorUpdateData.licenseNumber = licenseNumber
        if (education) doctorUpdateData.education = education
        if (clinicInfo) {
            doctorUpdateData.clinicInfo = {
                clinicName: clinicInfo.clinicName,
                clinicAddress: clinicInfo.clinicAddress
            }
        }
        if (bio) doctorUpdateData.bio = bio
        if (availability) doctorUpdateData.availability = availability
        
        let updatedDoctor = await Doctor.findOne({ userId: doctorId })
        if (Object.keys(doctorUpdateData).length > 0) {
            updatedDoctor = await Doctor.findOneAndUpdate({ userId: doctorId }, doctorUpdateData, { new: true })
        }
        if (!updatedDoctor) {
            throw new ApiError(404, "Doctor profile not found")
        }
        
        
        const updatedProfile = {
            _id: updatedDoctor._id,
            userId: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            profilePicture: updatedUser.profilePicture,
            speciality: updatedDoctor.speciality,
            otherSpeciality: updatedDoctor.otherSpeciality,
            yearsOfExperience: updatedDoctor.yearsOfExperience,
            licenseNumber: updatedDoctor.licenseNumber,
            education: updatedDoctor.education,
            clinicInfo: updatedDoctor.clinicInfo,
            bio: updatedDoctor.bio,
            rating: updatedDoctor.rating,
            totalReviews: updatedDoctor.totalReviews,
            availability: updatedDoctor.availability,
            isVerified: updatedDoctor.isVerified,
            updatedAt: updatedDoctor.updatedAt
        }
        
        return res.status(200).json(
            new ApiResponse(200, updatedProfile, "Doctor profile updated successfully")
        )
    } catch (error) {
        console.error('Error updating doctor profile:', error)
        throw new ApiError(500, "Failed to update doctor profile")
    }
})

export {
    getAllDoctors,
    getDoctorById,
    getDoctorAvailability,
    getDoctorProfile,
    updateDoctorProfile
}