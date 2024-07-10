import { Router } from 'express'
import { testSupplier } from '../controllers/supplier.js'

const router = Router()

// Routes
router.get('/', testSupplier)

export default router
