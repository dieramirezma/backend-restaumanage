import { Router } from 'express'
import { testUser, register, login } from '../controllers/user.js'

const router = Router()

// Routes
router.get('/', testUser)
router.post('/register', register)
router.post('/login', login)

export default router
