import express from 'express'
import connection from './database/connection.js  '
import { model, Schema } from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3900

console.log('Trying to connect to the database')
connection()

const User = model('User', new Schema({
  name: String
}), 'users')

async function showUsers () {
  try {
    const users = await User.find()
    console.log(users)
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

showUsers()
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
