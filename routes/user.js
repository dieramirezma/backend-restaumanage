import { Router } from 'express'
import { testUser, register, login, changePassword, getUsers, changeRole, getOnlyUser, logout } from '../controllers/user.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testUser)
router.post('/register', register)
router.post('/login', login)
router.put('/update', ensureAuth, changePassword)
router.get('/list/:page?', ensureAuth, getUsers)
router.put('/update-role', ensureAuth, changeRole)
router.get('/user/:id', ensureAuth, getOnlyUser)
router.post('/logout', ensureAuth, logout)

export default router
