import { Router } from 'express'
import { create, testSupplier } from '../controllers/supplier.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testSupplier)
router.post('/create', ensureAuth, create)

export default router
