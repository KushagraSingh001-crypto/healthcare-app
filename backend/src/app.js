import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import userRouter from './routes/auth.routes.js'
import patientRouter from './routes/patient.routes.js'
import doctorRouter from './routes/doctor.routes.js'
import dashBoardRouter from './routes/dashboard.routes.js'
import appointmentRouter from './routes/appointment.routes.js'

const app = express()

app.use(helmet())

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later'
})

app.use(limiter)


app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:5173'], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}))


app.use(cookieParser())
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))


app.use((req, res, next) => {
    console.log('Request cookies:', req.cookies);
    console.log('Request headers cookie:', req.headers.cookie);
    next();
});

app.use("/api/v1/users", userRouter)
app.use("/api/v1/patients", patientRouter)
app.use("/api/v1/doctors", doctorRouter)
app.use("/api/v1/dashboard", dashBoardRouter)
app.use("/api/v1/appointments", appointmentRouter)

export { app }