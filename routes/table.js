import { Router } from 'express'
import { create, getOneTable, getTables, testTable, update } from '../controllers/table.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testTable)
router.post('/create', ensureAuth, create)
router.put('/update/:id', ensureAuth, update)
router.get('/list/:page?', ensureAuth, getTables)
router.get('/table/:id', ensureAuth, getOneTable)

export default router
