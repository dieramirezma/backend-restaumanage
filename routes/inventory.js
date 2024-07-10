import { Router } from 'express'
import { testInventory } from '../controllers/inventory.js'

const router = Router()

// Routes
router.get('/', testInventory)

export default router
