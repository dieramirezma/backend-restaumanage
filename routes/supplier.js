import { Router } from 'express'
import { create, getOnlySupplier, getSuppliers, testSupplier, update } from '../controllers/supplier.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testSupplier)
router.post('/create', ensureAuth, create)
router.put('/update/:id', ensureAuth, update)
router.get('/list/:page?', ensureAuth, getSuppliers)
router.get('/supplier/:id', ensureAuth, getOnlySupplier)

export default router
