/* eslint-disable camelcase */
import mongoose from 'mongoose'
import User from '../models/user.js'
import Role from '../models/role.js'
import bcrypt from 'bcrypt'
import { createToken } from '../services/jwt.js'
import { getRoleById } from '../services/roleService.js'

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS)

export const testUser = (req, res) => {
  res.send('User controller works')
}

export const register = async (req, res) => {
  try {
    const params = req.body

    if (!params.username || !params.password || !params.email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all the required fields'
      })
    }

    const foundRole = await Role.findOne({ role_name: 'customer' })

    if (!foundRole) {
      return res.status(500).send({
        status: 'error',
        message: 'Role not found'
      })
    }

    const user = { ...params, role_id: foundRole._id }

    const userToSave = new User(user)

    const foundUser = await User.findOne({
      $or: [{
        username: userToSave.username,
        email: userToSave.email
      }]
    })

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
        email: userToSave.email,
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

    if ((!params.username && !params.email) || !params.password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all the required fields'
      })
    }

    const user = await User.findOne({
      $or: [
        { username: params.username },
        { email: params.email }
      ]
    })

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

    const token = createToken(user)

    // Config cookie
    // res.cookie('access_token', token, {
    //   httpOnly: true,
    //   maxAge: 1000 * 60 * 60
    // })

    return res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      user: {
        username: user.username,
        id: user._id,
        role: {
          role_name: role.role_name,
          permissions: role.permissions
        },
        token
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

export const changePassword = async (req, res) => {
  try {
    const { password } = req.body
    const { userId } = req.user

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all the required fields'
      })
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const newPassword = await bcrypt.hash(password, salt)

    const user = await User.findByIdAndUpdate(userId, { password: newPassword }, { new: true })

    if (!user) {
      return res.status(400).send({
        status: 'error',
        message: 'Error to update the user password'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error in the password change process'
    })
  }
}

export const getUsers = async (req, res) => {
  try {
    const { roleId } = req.user

    const roleUser = await Role.findById(roleId)

    if (!roleUser.permissions.includes('list_users') && !roleUser.permissions.includes('all')) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to list users'
      })
    }

    const page = req.params.page ? parseInt(req.params.page, 10) : 1
    const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5

    const options = {
      page,
      limit: itemsPerPage,
      select: '-password -role_id -__v',
      populate: {
        path: 'role_id',
        select: '-_id -__v -created_at'
      }
    }

    const users = await User.paginate({}, options)

    if (!users || users.docs.length === 0) {
      return res.status(404).send({
        status: 'error',
        message: 'No users available'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Get users successfully',
      data: {
        users: users.docs,
        totalDocs: users.totalDocs,
        totalPages: users.totalPages,
        page: users.page,
        pagingCounter: users.pagingCounter,
        hasPrevPage: users.hasPrevPage,
        hasNextPage: users.hasNextPage,
        prevPage: users.prevPage,
        nextPage: users.nextPage
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the get users process'
    })
  }
}

export const changeRole = async (req, res) => {
  try {
    const { userId } = req.user
    const { role_id } = req.body

    if (!role_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all the required fields'
      })
    }

    if (!mongoose.isValidObjectId(role_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role id'
      })
    }

    const user = await User.findByIdAndUpdate(userId, { role_id }, { new: true })

    if (!user) {
      return res.status(400).send({
        status: 'error',
        message: 'Error to update the user role'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'User role changed successfully'
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error in the user role change process'
    })
  }
}

export const getOnlyUser = async (req, res) => {
  try {
    const user_id = req.params.id

    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('get_user') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to get information from a user'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user id'
      })
    }

    const foundUser = await User.findById(user_id, '-created_at -__v -password').populate({
      path: 'role_id',
      select: '-__v -created_at'
    })

    if (!foundUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }

    return res.status(201).json({
      status: 'success',
      message: 'Get user information successfully',
      data: {
        user: foundUser
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the user get information process'
    })
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('access_token', {
      httpOnly: true
    })
    return res.status(200).send({
      status: 'success',
      message: 'User logged out successfully'
    })
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Error in the logout process'
    })
  }
}
