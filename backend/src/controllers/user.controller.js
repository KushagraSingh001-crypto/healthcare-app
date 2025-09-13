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
        console.error('Token generation error:', error);
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, phone, email, password, role, speciality, otherSpeciality, yearsOfExperience } = req.body

    console.log('=== REGISTRATION DEBUG ===');
    console.log('Registration data:', { fullName, phone, email, role, speciality, yearsOfExperience });

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

    console.log('Creating user with data:', userData);
    const user = await User.create(userData)
    console.log('User created:', user._id);

    
    if (role === 'doctor') {
        console.log('Creating doctor record...');
        const doctorData = {
            userId: user._id,
            speciality: finalSpeciality,
            otherSpeciality: speciality === 'Other' ? otherSpeciality : undefined,
            yearsOfExperience
        };
        console.log('Doctor data:', doctorData);
        
        const doctor = await Doctor.create(doctorData);
        console.log('Doctor created:', doctor._id);
        
    } else if (role === 'patient') {
        console.log("Creating patient for user:", user._id);
        const newPatient = await Patient.create({
            userId: user._id
        });
        console.log("Patient created:", newPatient);
    }

   
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Error occurred while registering the user")
    }

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_DOMAIN : undefined
    };

    console.log('Registration successful for:', createdUser.email, 'Role:', createdUser.role);
    console.log('Setting cookies with options:', cookieOptions);

    return res
        .status(201)
        .cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000 
        })
        .cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 10 * 24 * 60 * 60 * 1000 
        })
        .json(new ApiResponse(201, { 
            user: createdUser, 
            accessToken, 
            refreshToken 
        }, "User registered successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body

    console.log('=== LOGIN DEBUG ===');
    console.log('Login attempt for:', { email, role });

    if (!email) {
        throw new ApiError(400, "Email is required")
    }
    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
        console.log('User not found:', email);
        throw new ApiError(404, "User does not exist")
    }

    if (role && user.role !== role) {
        console.log('Role mismatch - expected:', role, 'actual:', user.role);
        throw new ApiError(400, "Invalid role selected for this account")
    }
    
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        console.log('Invalid password for user:', email);
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_DOMAIN : undefined
    };

    console.log('Login successful for:', loggedInUser.email, 'Role:', loggedInUser.role);
    console.log('Setting cookies with options:', cookieOptions);

    return res
        .status(200)
        .cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000 
        })
        .cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 10 * 24 * 60 * 60 * 1000 
        })
        .json(new ApiResponse(200, { 
            user: loggedInUser, 
            accessToken, 
            refreshToken 
        }, "User logged in successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    console.log('=== REFRESH TOKEN DEBUG ===');
    console.log('Refresh request received:', { 
        cookies: req.cookies, 
        body: req.body,
        headers: req.headers.cookie 
    });
    
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    if (!incomingRefreshToken) {
        console.log('No refresh token found in cookies or body');
        throw new ApiError(401, "Unauthorized request - No refresh token provided")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const userId = decodedToken._id || decodedToken.id;
        const user = await User.findById(userId)
        
        if (!user) {
            console.log('User not found for token:', userId);
            throw new ApiError(401, "Invalid refresh token - User not found")
        }
        
        if (incomingRefreshToken !== user?.refreshToken) {
            console.log('Token mismatch - stored vs provided');
            throw new ApiError(401, "Refresh Token is expired or used")
        }
        
        
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_DOMAIN : undefined
        };
        
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        console.log('Tokens refreshed successfully for user:', user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, {
                ...cookieOptions,
                maxAge: 24 * 60 * 60 * 1000 
            })
            .cookie("refreshToken", newRefreshToken, {
                ...cookieOptions,
                maxAge: 10 * 24 * 60 * 60 * 1000 
            })
            .json(new ApiResponse(200, { 
                accessToken, 
                refreshToken: newRefreshToken 
            }, "Access token refreshed"))
    } catch (error) {
        console.log('Refresh token error:', error.message);
        
       
        const clearOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_DOMAIN : undefined
        };
        
        res.clearCookie("accessToken", clearOptions);
        res.clearCookie("refreshToken", clearOptions);
        
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const logoutUser = asyncHandler(async (req, res) => {
    console.log('=== LOGOUT DEBUG ===');
    console.log('Logging out user:', req.user?.email);
    
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
    
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_DOMAIN : undefined
    }
    
    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser
}