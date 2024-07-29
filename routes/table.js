import { Router } from 'express'
import { create, getOneTable, getTables, testTable, update, updateStatus } from '../controllers/table.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testTable)
router.post('/create', ensureAuth, create)
router.put('/update/:id', ensureAuth, update)
router.get('/list/:page?', ensureAuth, getTables)
router.get('/table/:id', ensureAuth, getOneTable)
router.put('/update-status/:id', ensureAuth, updateStatus)
export default router
