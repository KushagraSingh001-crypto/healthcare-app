import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: {
    type: Date,
  },
  address: {
    type: String,
    trim: true
  },
  emergencyContact: {
    type: String
  },
  medicalInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: ''
    },
    allergies: {
      type: String,
      default: ''
    },
    chronicConditions: [{
      condition: String,
      diagnosedDate: Date,
      medications: [String]
    }],
    currentMedications: [{
      name: String,
      dosage: String,
      frequency: String
    }]
  }
}, {
  timestamps: true
});

patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

patientSchema.index({ userId: 1 });

export const Patient = mongoose.model("Patient", patientSchema);
