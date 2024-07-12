import { Router } from 'express'
import { create, getEmployees, testEmployee, update } from '../controllers/employee.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testEmployee)
router.post('/create', ensureAuth, create)
router.put('/update', ensureAuth, update)
router.get('/list', ensureAuth, getEmployees)

export default router
