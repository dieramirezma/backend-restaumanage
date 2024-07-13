import { Router } from 'express'
import { create, testInventory } from '../controllers/inventory.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testInventory)
router.post('/create', ensureAuth, create)

export default router
