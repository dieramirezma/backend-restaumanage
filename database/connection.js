import { connect } from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const connection = async () => {
  try {
    const { DEV_MONGODB_URI } = process.env
    await connect(DEV_MONGODB_URI)
    console.log('Connected to the database in Atlas')
  } catch (error) {
    console.log(error)
    throw new Error('Error connecting to the database')
  }
}

export default connection
