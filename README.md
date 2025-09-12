# HealthConnect

Welcome to **HealthConnect**, a comprehensive healthcare management system that seamlessly connects patients with doctors through streamlined appointment booking and real-time email notifications!

## 🌟 Features

* 🔐 **Role-based authentication** with secure JWT implementation for patients and doctors
* 📅 **Smart appointment management** - patients book, doctors accept/reject with instant status updates
* 📧 **Automated email notifications** via Gmail SMTP for booking confirmations and status changes
* 👨‍⚕️ **Doctor discovery** with detailed profiles and availability management
* 📊 **Intuitive dashboards** for both patients and healthcare providers
* 💬 **Messaging system UI** ready for real-time doctor-patient communication (backend integration pending)
* 🎨 **Modern UI/UX** built with React + TypeScript and shadcn/ui components
* ⚡ **Fast performance** powered by Vite build system

## 📂 Project Structure

```
HealthConnect/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── appointment.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── doctor.controller.js
│   │   │   ├── patient.controller.js
│   │   │   └── user.controller.js
│   │   ├── db/
│   │   │   └── index.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── models/
│   │   │   ├── appointment.model.js
│   │   │   ├── doctor.model.js
│   │   │   ├── patient.model.js
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   ├── appointment.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   ├── doctor.routes.js
│   │   │   └── patient.routes.js
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   ├── asyncHandler.js
│   │   │   └── emailService.js
│   │   ├── app.js
│   │   └── index.js
│   ├── .env
│   ├── .env.sample
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── placeholder.svg
│   │   └── robots.txt
│   ├── src/
│   │   ├── assets/
│   │   │   ├── doctor-emily-carter.jpg
│   │   │   ├── doctor-ethan-bennett.jpg
│   │   │   ├── doctor-olivia-hayes.jpg
│   │   │   ├── doctor-robert-harris.jpg
│   │   │   └── healthcare-hero.jpg
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── form.tsx
│   │   │       ├── input.tsx
│   │   │       ├── table.tsx
│   │   │       └── ... (50+ shadcn/ui components)
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── About.tsx
│   │   │   ├── Appointments.tsx
│   │   │   ├── BookAppointment.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── DoctorDashboard.tsx
│   │   │   ├── DoctorMessages.tsx
│   │   │   ├── DoctorProfile.tsx
│   │   │   ├── FindDoctor.tsx
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Messages.tsx
│   │   │   ├── PatientDashboard.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Services.tsx
│   │   │   └── Signup.tsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/healthconnect.git
   cd healthconnect
   ```

2. **Setup environment variables**
   * Configure `.env` in both `backend` and `frontend` with database URLs, JWT secrets, and Gmail SMTP credentials.

3. **Run backend server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Run frontend client**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🛠️ Tech Stack

**Frontend**
* React 18 + TypeScript
* Vite (Build tool)
* Tailwind CSS + shadcn/ui
* Axios for API calls

**Backend**
* Node.js + Express.js
* MongoDB
* JWT Authentication
* Gmail SMTP Integration
* Custom error handling

## 📱 Key Pages & Features

### For Patients
* **Dashboard** - Overview of appointments and health metrics
* **Find Doctor** - Browse and search healthcare providers
* **Book Appointment** - Schedule appointments with preferred doctors
* **Appointments** - Manage and track appointment status
* **Messages** - Communication interface (UI ready)
* **Profile** - Personal information and medical history

### For Doctors
* **Doctor Dashboard** - Appointment requests and patient overview
* **Doctor Profile** - Professional information and availability
* **Doctor Messages** - Patient communication interface (UI ready)
* **Appointment Management** - Accept/reject patient requests

## 📧 Email Notification System

Automated email notifications are sent for:
* ✅ Appointment booking confirmation
* ✅ Appointment approval by doctor
* ❌ Appointment rejection by doctor

## 🔐 Authentication & Security

* **JWT-based authentication** with secure token management
* **Role-based access control** (Patient/Doctor)
* **Protected routes** with middleware validation
* **Secure password handling** with encryption

## 🚀 Upcoming Features

* [ ] **Real-time messaging** backend implementation using WebSocket (UI completed)

## 📞 Support

For questions or support, please create an issue in this repository.

---

**HealthConnect** - Connecting healthcare, one appointment at a time! 🏥✨
