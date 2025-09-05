import { Router } from "express";
import { 
    getPatientProfile,
    updatePatientProfile 
} from '../controllers/patient.controller.js'
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js'


const router = Router()


// patient routes(protected)
router.route('/profile').get(verifyJWT,authorizeRoles('patient'),getPatientProfile)
router.route('/profile').patch(verifyJWT,authorizeRoles('patient'),updatePatientProfile)

export default router