import mongoose from 'mongoose'
import User from '../models/user.js'
import Role from '../models/role.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS)

export const testUser = (req, res) => {
  res.send('User controller works')
}

export const register = async (req, res) => {
  try {
    const params = req.body

    if (!params.username || !params.password || !params.role_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all the required fields'
      })
    }

    // Validate role ID
    if (!mongoose.Types.ObjectId.isValid(params.role_id)) {
      return res.status(400).send({
        status: 'error',
        message: 'Invalid ID'
      })
    }

    const foundRole = await Role.findById(params.role_id)
    if (!foundRole) {
      return res.status(404).send({
        status: 'error',
        message: 'Role not found'
      })
    }

    const userToSave = new User(params)

    const foundUser = await User.findOne({ username: params.username })
    if (foundUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User already exists'
      })
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hashedPassword = await bcrypt.hash(params.password, salt)

    userToSave.password = hashedPassword

    await userToSave.save()

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        username: userToSave.username,
        password: userToSave.password,
        role: {
          role_name: foundRole.role_name,
          permissions: foundRole.permissions
        }
      }
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error in the user registration process'
    })
  }
}

export const login = async (req, res) => {
  try {
    const params = req.body

    if (!params.username || !params.password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all the required fields'
      })
    }

    const user = await User.findOne({ username: params.username })
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }

    const isValidPassword = await bcrypt.compare(params.password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid password'
      })
    }

    const role = await Role.findById(user.role_id)

    return res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: {
        username: user.username,
        role: {
          role_name: role.role_name,
          permissions: role.permissions
        }
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the user login process'
    })
  }
}
