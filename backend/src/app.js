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
    max:100,
    message:'Too many requests from this IP,please try again later'
})
app.use(limiter)

app.use(cors({
    origin: (origin, callback) => {
      callback(null, true); 
    },
    credentials: true
  }));
  

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(cookieParser())

app.use("/api/v1/users",userRouter)
app.use("/api/v1/patients",patientRouter)
app.use("/api/v1/doctors",doctorRouter)
app.use("/api/v1/dashboard",dashBoardRouter)
app.use("/api/v1/appointments",appointmentRouter)


export { app }