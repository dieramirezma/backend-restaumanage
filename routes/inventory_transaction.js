import { Router } from 'express'
import { getTransactions, register, testInventoryTransaction } from '../controllers/inventory_transaction.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testInventoryTransaction)
router.post('/register', ensureAuth, register)
router.get('/list/:page?', ensureAuth, getTransactions)

export default router
