import { connect } from 'mongoose'

const connection = async () => {
  try {
    const DEV_MONGODB_URI = process.env.DEV_MONGODB_URI
    await connect(DEV_MONGODB_URI)
    console.log('Connected to the database in Atlas')
  } catch (error) {
    console.log(error)
    throw new Error('Error connecting to the database')
  }
}

export default connection
