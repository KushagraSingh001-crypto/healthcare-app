import mongoose from 'mongoose'

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    speciality: {
        type: String,
        required: [true, 'Speciality is required'],
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
        required: function () {
            return this.speciality === 'Other';
        }
    },
    yearsOfExperience: {
        type: Number,
        required: [true, 'Years of experience is required'],
        min: [0, 'Years of experience cannot be negative']
    },
    licenseNumber: {
        type: String,
        unique: true 
    },
    education: {
        type: String,
    },
    clinicInfo: {
        clinicName: {
            type: String,
        },
        clinicAddress: {
            type: String,
        }
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    availability: {
        monday: { start: String, end: String, available: Boolean },
        tuesday: { start: String, end: String, available: Boolean },
        wednesday: { start: String, end: String, available: Boolean },
        thursday: { start: String, end: String, available: Boolean },
        friday: { start: String, end: String, available: Boolean },
        saturday: { start: String, end: String, available: Boolean },
        sunday: { start: String, end: String, available: Boolean }
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

doctorSchema.index({ userId: 1 });
doctorSchema.index({ speciality: 1 });
doctorSchema.index({ rating: -1 });


export const Doctor = mongoose.model("Doctor", doctorSchema)
