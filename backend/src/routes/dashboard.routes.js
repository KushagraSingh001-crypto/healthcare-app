import { Router } from 'express'
import { 
    getPatientDashboard,
    getDoctorDashboard 
} from '../controllers/dashboard.controller.js'
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js'

const router = Router()

// Route to get patient dashboard data
router.get('/patient', verifyJWT, authorizeRoles('patient'), getPatientDashboard)

// Route to get doctor dashboard data
router.get('/doctor', verifyJWT, authorizeRoles('doctor'), getDoctorDashboard)

export default router