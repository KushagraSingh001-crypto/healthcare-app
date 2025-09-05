import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import { Patient } from '../models/patient.model.js'

const getPatientProfile = asyncHandler(async (req, res) => {
    const patient = await Patient.findOne({ userId: req.user._id })
        .populate('userId', '-password -refreshToken')
    
    if (!patient) {
        throw new ApiError(404, "Patient profile not found")
    }
    const profileData = {
        
        fullName: patient.userId.fullName,
        email: patient.userId.email,
        phone: patient.userId.phone,
        role: patient.userId.role,
        isActive: patient.userId.isActive,
        
        dateOfBirth: patient.dateOfBirth,
        age: patient.age, 
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        
        bloodType: patient.medicalInfo?.bloodType || '',
        allergies: patient.medicalInfo?.allergies || '',
        chronicConditions: patient.medicalInfo?.chronicConditions || [],
        currentMedications: patient.medicalInfo?.currentMedications || [],
        
        createdAt: patient.userId.createdAt,
        updatedAt: patient.updatedAt
    }

    return res
        .status(200)
        .json(new ApiResponse(200, profileData, "Patient profile fetched successfully"))
})

const updatePatientProfile = asyncHandler(async (req, res) => {
    const { 
        fullName, 
        phone, 
        dateOfBirth, 
        address, 
        emergencyContact, 
        bloodType, 
        allergies,
        chronicConditions,
        currentMedications
    } = req.body

    const patient = await Patient.findOne({ userId: req.user._id })
        .populate('userId', '-password -refreshToken')
    
    if (!patient) {
        throw new ApiError(404, "Patient profile not found")
    }

    if (fullName && fullName.trim().length < 2) {
        throw new ApiError(400, "Full name must be at least 2 characters")
    }

    if (phone && !/^[\+]?[\d\s\(\)\-]+$/.test(phone)) {
        throw new ApiError(400, "Please provide a valid phone number")
    }

    if (dateOfBirth && new Date(dateOfBirth) > new Date()) {
        throw new ApiError(400, "Date of birth cannot be in the future")
    }

    if (bloodType && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''].includes(bloodType)) {
        throw new ApiError(400, "Invalid blood type")
    }

    const userUpdates = {}
    if (fullName !== undefined) userUpdates.fullName = fullName.trim()
    if (phone !== undefined) userUpdates.phone = phone.trim()

    if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(req.user._id, userUpdates, { 
            new: true, 
            runValidators: true 
        })
    }

    const patientUpdates = {}
    if (dateOfBirth !== undefined) patientUpdates.dateOfBirth = dateOfBirth
    if (address !== undefined) patientUpdates.address = address.trim()
    if (emergencyContact !== undefined) patientUpdates.emergencyContact = emergencyContact.trim()

    const medicalInfo = { ...patient.medicalInfo }
    if (bloodType !== undefined) medicalInfo.bloodType = bloodType
    if (allergies !== undefined) medicalInfo.allergies = allergies.trim()
    if (chronicConditions !== undefined) medicalInfo.chronicConditions = chronicConditions
    if (currentMedications !== undefined) medicalInfo.currentMedications = currentMedications

    patientUpdates.medicalInfo = medicalInfo

    const updatedPatient = await Patient.findByIdAndUpdate(
        patient._id, 
        patientUpdates, 
        { new: true, runValidators: true }
    ).populate('userId', '-password -refreshToken')

    const updatedProfileData = {
        
        fullName: updatedPatient.userId.fullName,
        email: updatedPatient.userId.email,
        phone: updatedPatient.userId.phone,
        role: updatedPatient.userId.role,
        isActive: updatedPatient.userId.isActive,
        
        dateOfBirth: updatedPatient.dateOfBirth,
        age: updatedPatient.age,
        address: updatedPatient.address,
        emergencyContact: updatedPatient.emergencyContact,
        
        bloodType: updatedPatient.medicalInfo?.bloodType || '',
        allergies: updatedPatient.medicalInfo?.allergies || '',
        chronicConditions: updatedPatient.medicalInfo?.chronicConditions || [],
        currentMedications: updatedPatient.medicalInfo?.currentMedications || [],
        
        createdAt: updatedPatient.userId.createdAt,
        updatedAt: updatedPatient.updatedAt
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedProfileData, "Patient profile updated successfully"))
})

export {
    getPatientProfile,
    updatePatientProfile
}