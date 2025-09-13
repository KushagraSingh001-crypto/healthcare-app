import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        
        const cookieToken = req.cookies?.accessToken;
        const headerToken = req.header("Authorization")?.replace("Bearer ", "");
        const altHeaderToken = req.headers?.authorization?.replace("Bearer ", "");
        
        const token = cookieToken || headerToken || altHeaderToken;
        
        console.log('=== AUTH MIDDLEWARE DEBUG ===');
        console.log('Cookie token:', cookieToken ? 'present' : 'missing');
        console.log('Auth header token:', headerToken ? 'present' : 'missing');
        console.log('Alt header token:', altHeaderToken ? 'present' : 'missing');
        console.log('Final token:', token ? 'found' : 'not found');
        console.log('All cookies:', req.cookies);
        console.log('All headers:', req.headers);

        if (!token) {
            throw new ApiError(401, "Unauthorized request - No access token")
        }

        
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log('Token decoded successfully:', { id: decodedToken._id || decodedToken.id });
        } catch (jwtError) {
            console.log('JWT verification failed:', jwtError.message);
            throw new ApiError(401, "Invalid or expired access token");
        }

        
        const userId = decodedToken._id || decodedToken.id;
        const user = await User.findById(userId).select('-password -refreshToken');
        
        if (!user) {
            console.log('User not found for ID:', userId);
            throw new ApiError(401, "Invalid access token - User not found");
        }

        console.log('User authenticated successfully:', { id: user._id, email: user.email, role: user.role });
        req.user = user;
        next();
        
    } catch (error) {
        console.log('Authentication failed:', error.message);
        
        
        if (error instanceof ApiError) {
            throw error;
        }
        
        
        throw new ApiError(401, error?.message || "Authentication failed");
    }
});

export const authorizeRoles = (...roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }
        
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, `Access denied. Required role: ${roles.join(' or ')}, but user has role: ${req.user.role}`);
        }
        
        console.log(`User ${req.user.email} authorized with role: ${req.user.role}`);
        next();
    });
};