import { User } from '../models/user.model.js';
import { Patient } from '../models/patient.model.js';
import { Doctor } from '../models/doctor.model.js';
import { Appointment } from '../models/appointment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

function calculatePatientProfileCompletion(patient) {
  const fields = [
    patient.userId?.fullName,
    patient.userId?.email,
    patient.userId?.phone,
    patient.dateOfBirth,
    patient.address,
    patient.emergencyContact,
    patient.medicalInfo?.bloodType,
    patient.userId?.profilePicture
  ];
  const completedFields = fields.filter(field =>
    field && field !== '' && field !== null && field !== undefined
  ).length;
  return Math.round((completedFields / fields.length) * 100);
}

function calculateDoctorProfileCompletion(doctor) {
  const fields = [
    doctor.userId?.fullName,
    doctor.userId?.email,
    doctor.userId?.phone,
    doctor.speciality,
    doctor.yearsOfExperience,
    doctor.licenseNumber,
    doctor.education,
    doctor.clinicInfo?.clinicName,
    doctor.clinicInfo?.clinicAddress,
    doctor.bio
  ];
  const completedFields = fields.filter(field =>
    field && field !== '' && field !== null && field !== undefined
  ).length;
  return Math.round((completedFields / fields.length) * 100);
}

export const getPatientDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const patient = await Patient.findOne({ userId }).populate({
      path: 'userId',
      select: 'fullName email profilePicture'
    });
    if (!patient) {
      throw new ApiError(404, 'Patient profile not found');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingAppointments = await Appointment.find({
      patientId: userId,
      appointmentDate: { $gte: today },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate({
        path: 'doctorId',
        select: 'fullName profilePicture'
      })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(10);
    
    const [totalAppointments, completedAppointments, pendingAppointments] = await Promise.all([
      Appointment.countDocuments({ patientId: userId }),
      Appointment.countDocuments({
        patientId: userId,
        status: 'completed'
      }),
      Appointment.countDocuments({
        patientId: userId,
        status: 'pending'
      })
    ]);
    
    const recentAppointments = await Appointment.find({
      patientId: userId,
      status: 'completed'
    })
      .populate({
        path: 'doctorId',
        select: 'fullName profilePicture'
      })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(5);
    
    const doctorIds = [...upcomingAppointments, ...recentAppointments]
      .map(apt => apt.doctorId?._id)
      .filter(Boolean);
    const doctors = await Doctor.find({ userId: { $in: doctorIds } })
      .select('userId speciality');
    const doctorSpecialityMap = {};
    doctors.forEach(doc => {
      doctorSpecialityMap[doc.userId.toString()] = doc.speciality;
    });
    
    const formattedUpcomingAppointments = upcomingAppointments.map(appointment => ({
      id: appointment._id,
      doctorName: appointment.doctorId?.fullName || 'Unknown Doctor',
      doctorImage: appointment.doctorId?.profilePicture || '',
      speciality: doctorSpecialityMap[appointment.doctorId?._id?.toString()] || 'General',
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
      appointmentType: appointment.appointmentType,
      status: appointment.status,
      reason: appointment.reason,
      isUrgent: appointment.isUrgent || false
    }));
    
    const formattedRecentAppointments = recentAppointments.map(appointment => ({
      id: appointment._id,
      doctorName: appointment.doctorId?.fullName || 'Unknown Doctor',
      speciality: doctorSpecialityMap[appointment.doctorId?._id?.toString()] || 'General',
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
      appointmentType: appointment.appointmentType
    }));
    const profileCompletionScore = calculatePatientProfileCompletion(patient);
    const dashboardData = {
      patient: {
        id: patient._id,
        fullName: patient.userId.fullName,
        email: patient.userId.email,
        profilePicture: patient.userId.profilePicture,
        profileCompletion: profileCompletionScore
      },
      statistics: {
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        upcomingAppointments: upcomingAppointments.length
      },
      upcomingAppointments: formattedUpcomingAppointments,
      recentAppointments: formattedRecentAppointments,
      quickActions: [
        {
          title: 'Book Appointment',
          description: 'Schedule with a healthcare provider',
          action: 'book-appointment',
          icon: 'calendar-plus'
        },
        {
          title: 'View Medical History',
          description: 'Access your health records',
          action: 'medical-history',
          icon: 'file-medical'
        },
        {
          title: 'Update Profile',
          description: 'Keep your information current',
          action: 'update-profile',
          icon: 'user'
        }
      ]
    };
    res.status(200).json(
      new ApiResponse(200, dashboardData, 'Patient dashboard data retrieved successfully')
    );
  } catch (error) {
    console.error('Error in getPatientDashboard:', error);
    throw new ApiError(500, 'Failed to retrieve patient dashboard data');
  }
});

export const getDoctorDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const doctor = await Doctor.findOne({ userId }).populate({
      path: 'userId',
      select: 'fullName email profilePicture'
    });
    if (!doctor) {
      throw new ApiError(404, 'Doctor profile not found');
    }
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const startOfTomorrow = new Date(startOfDay);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const endOfUpcoming = new Date(startOfDay);
    endOfUpcoming.setDate(endOfUpcoming.getDate() + 7); 

    
    const todayAppointments = await Appointment.find({
      doctorId: userId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'pending'] }
    })
      .populate({
        path: 'patientId',
        select: 'fullName profilePicture phone'
      })
      .sort({ appointmentTime: 1 });

    
    const upcomingAppointments = await Appointment.find({
      doctorId: userId,
      appointmentDate: { $gte: startOfTomorrow, $lte: endOfUpcoming },
      status: 'confirmed'
    })
      .populate({
        path: 'patientId',
        select: 'fullName profilePicture phone'
      })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(10);

    
    const pendingAppointments = await Appointment.find({
      doctorId: userId,
      status: 'pending'
    })
      .populate({
        path: 'patientId',
        select: 'fullName profilePicture phone'
      })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(10);

    
    const [
      totalPatients,
      todayAppointmentsCount,
      completedTodayCount,
      pendingRequestsCount,
      totalCompletedAppointments,
      upcomingCount
    ] = await Promise.all([
      Appointment.distinct('patientId', { doctorId: userId }).then(patients => patients.length),
      Appointment.countDocuments({
        doctorId: userId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['confirmed', 'pending'] }
      }),
      Appointment.countDocuments({
        doctorId: userId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'completed'
      }),
      Appointment.countDocuments({
        doctorId: userId,
        status: 'pending'
      }),
      Appointment.countDocuments({
        doctorId: userId,
        status: 'completed'
      }),
      Appointment.countDocuments({
        doctorId: userId,
        appointmentDate: { $gte: startOfTomorrow, $lte: endOfUpcoming },
        status: 'confirmed'
      })
    ]);

    
    const confirmedTodayAppointments = todayAppointments
      .filter(apt => apt.status === 'confirmed')
      .map(appointment => ({
        id: appointment._id,
        patientName: appointment.patientId?.fullName || 'Unknown Patient',
        patientAvatar: appointment.patientId?.profilePicture || '',
        patientPhone: appointment.patientId?.phone || '',
        time: appointment.appointmentTime,
        date: appointment.appointmentDate,
        appointmentType: appointment.appointmentType,
        reason: appointment.reason,
        status: appointment.status,
        duration: appointment.duration,
        isUrgent: appointment.isUrgent || false,
        patientNotes: appointment.notes?.patientNotes || ''
      }));

   
    const formattedUpcomingAppointments = upcomingAppointments.map(appointment => ({
      id: appointment._id,
      patientName: appointment.patientId?.fullName || 'Unknown Patient',
      patientAvatar: appointment.patientId?.profilePicture || '',
      patientPhone: appointment.patientId?.phone || '',
      time: appointment.appointmentTime,
      date: appointment.appointmentDate,
      appointmentType: appointment.appointmentType,
      reason: appointment.reason,
      status: appointment.status,
      duration: appointment.duration,
      isUrgent: appointment.isUrgent || false,
      patientNotes: appointment.notes?.patientNotes || ''
    }));

    
    const formattedPendingRequests = pendingAppointments.map(appointment => ({
      id: appointment._id,
      patientName: appointment.patientId?.fullName || 'Unknown Patient',
      patientAvatar: appointment.patientId?.profilePicture || '',
      patientPhone: appointment.patientId?.phone || '',
      time: appointment.appointmentTime,
      date: appointment.appointmentDate,
      appointmentType: appointment.appointmentType,
      type: appointment.appointmentType,
      reason: appointment.reason,
      duration: appointment.duration,
      isUrgent: appointment.isUrgent || false,
      requestedAt: appointment.createdAt,
      patientNotes: appointment.notes?.patientNotes || '',
      status: appointment.status
    }));

    const profileCompletionScore = calculateDoctorProfileCompletion(doctor);
    const dashboardData = {
      doctor: {
        id: doctor._id,
        fullName: doctor.userId.fullName,
        email: doctor.userId.email,
        profilePicture: doctor.userId.profilePicture,
        speciality: doctor.speciality,
        yearsOfExperience: doctor.yearsOfExperience,
        rating: doctor.rating,
        totalReviews: doctor.totalReviews,
        isVerified: doctor.isVerified,
        profileCompletion: profileCompletionScore
      },
      statistics: {
        todayAppointments: todayAppointmentsCount,
        totalPatients,
        completedToday: completedTodayCount,
        pendingRequests: pendingRequestsCount,
        upcomingAppointments: upcomingCount,
        totalCompleted: totalCompletedAppointments,
        unreadMessages: 0
      },
      todaySchedule: confirmedTodayAppointments, 
      upcomingSchedule: formattedUpcomingAppointments, 
      pendingRequests: formattedPendingRequests, 
      quickActions: [
        {
          title: 'Manage Availability',
          description: 'Update your schedule and working hours',
          action: 'manage-availability',
          icon: 'calendar'
        },
        {
          title: 'View All Appointments',
          description: 'See your complete appointment history',
          action: 'all-appointments',
          icon: 'calendar-check'
        },
        {
          title: 'Patient Records',
          description: 'Access patient medical histories',
          action: 'patient-records',
          icon: 'users'
        },
        {
          title: 'Update Profile',
          description: 'Keep your professional info current',
          action: 'update-profile',
          icon: 'user'
        }
      ]
    };
    res.status(200).json(
      new ApiResponse(200, dashboardData, 'Doctor dashboard data retrieved successfully')
    );
  } catch (error) {
    console.error('Error in getDoctorDashboard:', error);
    throw new ApiError(500, 'Failed to retrieve doctor dashboard data');
  }
});