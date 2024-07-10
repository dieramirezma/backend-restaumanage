import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connection from './database/connection.js '
import EmployeeRoutes from './routes/employee.js'
import InventoryRoutes from './routes/inventory.js'
import InventoryTransactionRoutes from './routes/inventory_transaction.js'
import ReservationRoutes from './routes/reservation.js'
import RoleRoutes from './routes/role.js'
import SupplierRoutes from './routes/supplier.js'
import TableRoutes from './routes/table.js'
import UserRoutes from './routes/user.js'

const PORT = process.env.PORT || 3900

console.log('Trying to connect to the database')
connection()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(cors({
  origin: '*',
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  optionsSuccessStatus: 200
}))

// Routes
app.use('/api/employees', EmployeeRoutes)
app.use('/api/inventories', InventoryRoutes)
app.use('/api/transactions', InventoryTransactionRoutes)
app.use('/api/reservations', ReservationRoutes)
app.use('/api/roles', RoleRoutes)
app.use('/api/suppliers', SupplierRoutes)
app.use('/api/tables', TableRoutes)
app.use('/api/users', UserRoutes)

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}: http://localhost:3000`)
})
