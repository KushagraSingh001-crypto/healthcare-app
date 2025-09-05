import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
      },
      appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required']
      },
      appointmentTime: {
        type: String,
        required: [true, 'Appointment time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
      },
      appointmentType: {
        type: String,
        required: [true, 'Appointment type is required'],
        enum: ['consultation', 'checkup', 'followup', 'emergency']
      },
      reason: {
        type: String,
        required: [true, 'Reason for visit is required'],
        trim: true
      },
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
        default: 'pending'
      },
      notes: {
        doctorNotes: {
          type: String,
          default: ''
        },
        patientNotes: {
          type: String,
          default: ''
        }
      },
      duration: {
        type: Number,
        default: 30
      },
      isUrgent: {
        type: Boolean,
        default: false
      }
    }, {
      timestamps: true
})

appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });

export const Appointment = mongoose.model("Appointment",appointmentSchema)