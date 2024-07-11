import Role from '../models/role.js'

export const getRoleById = async (id) => {
  try {
    if (!id) throw new Error('Please provide a role id')

    const role = await Role.findById(id)

    return {
      role_name: role.role_name,
      role_permissions: role.permissions
    }
  } catch (error) {
    console.log(error)
    return { role_name: null, role_permissions: null }
  }
}
