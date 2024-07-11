import { Router } from 'express'
import { create, testEmployee } from '../controllers/employee.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testEmployee)
router.post('/create', ensureAuth, create)

export default router
