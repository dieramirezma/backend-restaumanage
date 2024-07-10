import { Router } from 'express'
import { testUser } from '../controllers/user.js'

const router = Router()

// Routes
router.get('/', testUser)

export default router
