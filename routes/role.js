import { Router } from 'express'
import { create, testRole } from '../controllers/role.js'

const router = Router()

// Routes
router.get('/', testRole)
router.post('/create', create)

export default router
