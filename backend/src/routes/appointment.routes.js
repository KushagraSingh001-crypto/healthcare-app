import { Router } from 'express'
import { 
    getUserAppointments,
    bookAppointment,
    editAppointment,
    cancelAppointment,
    getDoctorAppointments,
    updateAppointmentStatus 
} from '../controllers/appointment.controller.js'
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js'

const router = Router()
// patient routes
router.route('/').get(verifyJWT,getUserAppointments)
router.route('/').post(verifyJWT,authorizeRoles('patient'),bookAppointment)
router.route('/:id').put(verifyJWT,authorizeRoles('patient'),editAppointment)
router.route('/:id').delete(verifyJWT,authorizeRoles('patient'),cancelAppointment)

// doctor routes
router.route('/doctor').get(verifyJWT,authorizeRoles('doctor'),getDoctorAppointments)
router.route('/:id/status').put(verifyJWT,authorizeRoles('doctor'),updateAppointmentStatus)

export default router
