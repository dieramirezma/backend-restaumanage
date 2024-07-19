import { connect } from 'mongoose'

const connection = async () => {
  try {
    const MONGODB_URI = process.env.NODE_ENV === 'production'
      ? process.env.PROD_MONGODB_URI
      : process.env.DEV_MONGODB_URI
    await connect(MONGODB_URI)
    console.log('Connected to the database in Atlas')
  } catch (error) {
    console.log(error)
    throw new Error('Error connecting to the database')
  }
}

export default connection
