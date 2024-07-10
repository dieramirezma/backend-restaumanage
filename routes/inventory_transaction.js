import { Router } from 'express'
import { testInventoryTransaction } from '../controllers/inventory_transaction.js'

const router = Router()

// Routes
router.get('/', testInventoryTransaction)

export default router
