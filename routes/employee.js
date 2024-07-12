import { Router } from 'express'
import { create, getEmployees, testEmployee, update, updatePayroll } from '../controllers/employee.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testEmployee)
router.post('/create', ensureAuth, create)
router.put('/update', ensureAuth, update)
router.get('/list', ensureAuth, getEmployees)
router.put('/payroll/:id', ensureAuth, updatePayroll)

export default router
