import { Router } from 'express'
import { testRole } from '../controllers/role.js'

const router = Router()

// Routes
router.get('/', testRole)

export default router
