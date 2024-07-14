import { Router } from 'express'
import { create, deleteItem, getInventoryItems, getOneInventoryItem, getQuantityAndReorderLevel, testInventory, updateQuantity } from '../controllers/inventory.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/', testInventory)
router.post('/create', ensureAuth, create)
router.put('/update-quantity/:id', ensureAuth, updateQuantity)
router.delete('/delete/:id', ensureAuth, deleteItem)
router.get('/list/:page?', ensureAuth, getInventoryItems)
router.get('/item/:id', ensureAuth, getOneInventoryItem)
router.get('/item-quantity/:id', ensureAuth, getQuantityAndReorderLevel)

export default router
