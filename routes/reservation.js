import { Router } from 'express'
import { testReservation } from '../controllers/reservation.js'

const router = Router()

// Routes
router.get('/', testReservation)

export default router
