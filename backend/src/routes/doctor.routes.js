import { Router } from "express";
import {
    getAllDoctors,
    getDoctorById,
    getDoctorAvailability,
    getDoctorProfile,
    updateDoctorProfile
} from '../controllers/doctor.controller.js'

import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js'

const router = Router()

// public routes
router.route('/').get(getAllDoctors)
router.route('/profile').get(verifyJWT, authorizeRoles('doctor'), getDoctorProfile)
router.route('/profile').post(verifyJWT, authorizeRoles('doctor'), updateDoctorProfile)
router.route('/:id/availability').get(getDoctorAvailability)  
router.route('/:id').get(getDoctorById) 

export default router


