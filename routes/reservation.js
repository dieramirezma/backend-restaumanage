import { Router } from 'express'
import { create, deleteReservation, getOneReservation, getReservations, testReservation } from '../controllers/reservation.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testReservation)
router.post('/create', ensureAuth, create)
router.delete('/delete/:id', ensureAuth, deleteReservation)
router.get('/list/:page?', ensureAuth, getReservations)
router.get('/reservation/:id', ensureAuth, getOneReservation)

export default router
