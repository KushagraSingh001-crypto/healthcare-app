import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[\+]?[\d\s\(\)\-]+$/, 'Please provide a valid phone number']
    },
    role: {
        type: String,
        enum: ['patient', 'doctor'],
        required: [true, 'Role is required']
    },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    refreshToken: { type: String, default: null },
    
    speciality: {
        type: String,
        required: function() { return this.role === 'doctor' },
        enum: [
            'Cardiologist',
            'Dermatologist', 
            'Neurologist',
            'Pediatrician',
            'Orthopedic',
            'General Physician',
            'Other'
        ]
    },
    otherSpeciality: {
        type: String,
        required: function() { return this.role === 'doctor' && this.speciality === 'Other' }
    },
    yearsOfExperience: {
        type: Number,
        required: function() { return this.role === 'doctor' },
        min: [0, 'Years of experience cannot be negative']
    }
}, { timestamps: true });


userSchema.index({ role: 1 });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


userSchema.pre('findOneAndUpdate', function() {
    if (this.getUpdate().$set && this.getUpdate().$set.refreshToken) {
        this.getUpdate().$set.lastLogin = new Date();
    }
});


userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.generateAccessToken = function () {
    const payload = {
        _id: this._id, 
        email: this.email,
        fullName: this.fullName,
        role: this.role
    };
    
    console.log('Generating access token with payload:', payload);
    
    return jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' }
    );
};


userSchema.methods.generateRefreshToken = function () {
    const payload = {
        _id: this._id 
    };
    
    console.log('Generating refresh token with payload:', payload);
    
    return jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d' }
    );
};


userSchema.methods.getPublicProfile = function () {
    const user = this.toObject();
    delete user.password;
    delete user.refreshToken;
    return user;
};


userSchema.statics.findWithPassword = function(query) {
    return this.findOne(query).select('+password');
};


userSchema.virtual('fullSpeciality').get(function() {
    if (this.role !== 'doctor') return null;
    return this.speciality === 'Other' ? this.otherSpeciality : this.speciality;
});


userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export const User = mongoose.model("User", userSchema);