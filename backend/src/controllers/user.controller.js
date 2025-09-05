import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { Doctor } from '../models/doctor.model.js'
import { Patient } from '../models/patient.model.js'

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, phone, email, password, role, speciality, otherSpeciality, yearsOfExperience } = req.body

    if ([fullName, phone, email, password, role].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All basic fields are required")
    }

    if (role === "doctor") {
        if ([speciality, yearsOfExperience].some((field) => !field)) {
            throw new ApiError(400, "Speciality and Years Of Experience are required for doctors")
        }
        if (speciality === "Other" && !otherSpeciality?.trim()) {
            throw new ApiError(400, "Please specify your speciality")
        }
    }

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new ApiError(409, "User with this email already exists")
    }

    const finalSpeciality = speciality === "Other" ? otherSpeciality : speciality

    const userData = {
        fullName,
        phone,
        email,
        password,
        role
    }

    if (role === 'doctor') {
        userData.speciality = finalSpeciality
        userData.yearsOfExperience = yearsOfExperience
    }

    const user = await User.create(userData)

    if (role === 'doctor') {
        await Doctor.create({
            userId: user._id,
            speciality: finalSpeciality,
            otherSpeciality: speciality === 'Other' ? otherSpeciality : undefined,
            yearsOfExperience
        })
    } if (role === 'patient') {
        console.log("Creating patient for user:", user._id);
        const newPatient = await Patient.create({
          userId: user._id
        });
        console.log("Patient created:", newPatient);
      }
      

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Error occurred while registering the user")
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"))

})


const loginUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body

    if (!email) {
        throw new ApiError(400, "Email is required")
    }
    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    if (role && user.role !== role) {
        throw new ApiError(400, "Invalid role selected for this account")
    }
    
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }
        
        const options = {
            httpOnly: true,
            secure: true
        }
        
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200,req.user,"Current user fetched successfully"))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser
}