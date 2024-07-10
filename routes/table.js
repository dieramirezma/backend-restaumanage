import { Router } from 'express'
import { testTable } from '../controllers/table.js'

const router = Router()

// Routes
router.get('/', testTable)

export default router
