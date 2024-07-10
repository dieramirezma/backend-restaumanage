/* eslint-disable camelcase */
import Role from '../models/role.js'

export const testRole = (req, res) => {
  res.send('Role controller works')
}

export const create = async (req, res) => {
  try {
    const params = req.body

    if (!params.role_name || !params.permissions) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all the required fields'
      })
    }

    const roleToSave = new Role(params)

    const foundRole = await Role.findOne({ role_name: params.role_name })

    if (foundRole) {
      return res.status(409).json({
        status: 'error',
        message: 'Role already exists'
      })
    }

    await roleToSave.save()

    return res.status(200).json({
      status: 'success',
      message: 'Role created successfully',
      data: roleToSave
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error in the role creation process'
    })
  }
}
