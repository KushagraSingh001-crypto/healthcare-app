import nodemailer from 'nodemailer'
import { ApiError } from './ApiError.js'


const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS  
    }
  })
}


const emailTemplates = {
  appointmentBooked: (patientName, doctorName, appointmentDate, appointmentTime) => ({
    subject: 'Appointment Request Submitted - HealthConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Request Submitted</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment request has been successfully submitted and is pending doctor approval.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Appointment Details:</h3>
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Status:</strong> <span style="color: #f59e0b;">Pending Confirmation</span></p>
        </div>
        
        <p>You will receive another email once the doctor reviews and responds to your request.</p>
        <p>Thank you for choosing HealthConnect!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  }),

  appointmentConfirmed: (patientName, doctorName, appointmentDate, appointmentTime) => ({
    subject: 'Appointment Confirmed - HealthConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Appointment Confirmed!</h2>
        <p>Dear ${patientName},</p>
        <p>Great news! Your appointment has been confirmed by the doctor.</p>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Confirmed Appointment Details:</h3>
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Status:</strong> <span style="color: #059669;">Confirmed</span></p>
        </div>
        
        <p><strong>Please note:</strong></p>
        <ul>
          <li>Arrive 15 minutes early for check-in</li>
          <li>Bring a valid ID and insurance card</li>
          <li>Bring any relevant medical records</li>
        </ul>
        
        <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
        <p>We look forward to seeing you!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  }),

  appointmentCancelled: (patientName, doctorName, appointmentDate, appointmentTime, cancelledBy) => ({
    subject: 'Appointment Cancelled - HealthConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Appointment Cancelled</h2>
        <p>Dear ${patientName},</p>
        <p>We regret to inform you that your appointment has been cancelled.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Cancelled Appointment Details:</h3>
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Cancelled by:</strong> ${cancelledBy}</p>
        </div>
        
        <p>You can book a new appointment at your convenience through your patient dashboard.</p>
        <p>We apologize for any inconvenience caused.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  }),

  appointmentRejected: (patientName, doctorName, appointmentDate, appointmentTime) => ({
    subject: 'Appointment Request Declined - HealthConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Appointment Request Declined</h2>
        <p>Dear ${patientName},</p>
        <p>Unfortunately, your appointment request could not be accommodated at this time.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Declined Appointment:</h3>
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Requested Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Requested Time:</strong> ${appointmentTime}</p>
        </div>
        
        <p>This could be due to:</p>
        <ul>
          <li>Doctor's schedule conflict</li>
          <li>The time slot is no longer available</li>
          <li>Emergency or unexpected circumstances</li>
        </ul>
        
        <p>Please try booking a different time slot or contact us for assistance.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  })
}


export const sendEmail = async (to, template) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"HealthConnect" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: template.subject,
      html: template.html
    }
    
    const result = await transporter.sendMail(mailOptions)
    return result
  } catch (error) {
    console.error('Email sending failed:', error)
    throw new ApiError(500, 'Failed to send email notification')
  }
}

export const sendAppointmentBookedEmail = async (patientEmail, patientName, doctorName, appointmentDate, appointmentTime) => {
  const template = emailTemplates.appointmentBooked(patientName, doctorName, appointmentDate, appointmentTime)
  return await sendEmail(patientEmail, template)
}

export const sendAppointmentConfirmedEmail = async (patientEmail, patientName, doctorName, appointmentDate, appointmentTime) => {
  const template = emailTemplates.appointmentConfirmed(patientName, doctorName, appointmentDate, appointmentTime)
  return await sendEmail(patientEmail, template)
}

export const sendAppointmentCancelledEmail = async (patientEmail, patientName, doctorName, appointmentDate, appointmentTime, cancelledBy) => {
  const template = emailTemplates.appointmentCancelled(patientName, doctorName, appointmentDate, appointmentTime, cancelledBy)
  return await sendEmail(patientEmail, template)
}

export const sendAppointmentRejectedEmail = async (patientEmail, patientName, doctorName, appointmentDate, appointmentTime) => {
  const template = emailTemplates.appointmentRejected(patientName, doctorName, appointmentDate, appointmentTime)
  return await sendEmail(patientEmail, template)
}