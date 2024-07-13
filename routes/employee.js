import { Router } from 'express'
import { create, getEmployees, getOnlyEmployee, getPayroll, getSchedule, testEmployee, update, updatePayroll, updateSchedule } from '../controllers/employee.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testEmployee)
router.post('/create', ensureAuth, create)
router.put('/update', ensureAuth, update)
router.get('/list', ensureAuth, getEmployees)
router.put('/payroll/:id', ensureAuth, updatePayroll)
router.put('/schedule/:id', ensureAuth, updateSchedule)
router.get('/payroll-show', ensureAuth, getPayroll)
router.get('/schedule-show', ensureAuth, getSchedule)
router.get('/employee/:id', ensureAuth, getOnlyEmployee)

export default router
