import { Router } from 'express'
import { testEmployee } from '../controllers/employee.js'

const router = Router()

// Routes
router.get('/', testEmployee)

export default router
