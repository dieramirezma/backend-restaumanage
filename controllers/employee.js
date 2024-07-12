/* eslint-disable camelcase */
import { getRoleById } from '../services/roleService.js'
import Employee from '../models/employee.js'

export const testEmployee = (req, res) => {
  res.send('Employee controller works')
}

export const create = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      contact_number,
      email,
      address
    } = req.body

    const { userId, roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (role_name === 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to create an employee'
      })
    }

    if (!first_name || !last_name || !contact_number || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      })
    }

    const employeeObj = {
      user_id: userId,
      first_name,
      last_name,
      contact_number,
      email,
      address,
      role_id: roleId
    }

    if (!address) delete employeeObj.address

    const employee = new Employee(employeeObj)

    const foundEmployee = await Employee.findOne({ user_id: userId })

    if (foundEmployee) {
      return res.status(409).json({
        status: 'error',
        message: 'Employee already exists'
      })
    }

    await employee.save()

    return res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      data: {
        user_id: employee.user_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        contact_number: employee.contact_number,
        email: employee.email,
        address: employee.address,
        role: {
          role_name,
          role_permissions
        }
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the employee creation process'
    })
  }
}

export const update = async (req, res) => {
  try {
    const employeeToUpdate = req.body

    const { userId, roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (role_name === 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to create an employee'
      })
    }

    const foundEmployee = await Employee.findOne({ user_id: userId })

    if (!foundEmployee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      })
    }

    delete employeeToUpdate.user_id
    delete employeeToUpdate.role_id
    delete employeeToUpdate.hire_date
    delete employeeToUpdate.created_at
    delete employeeToUpdate.payroll
    delete employeeToUpdate.schedule
    delete employeeToUpdate.__v
    delete employeeToUpdate._id

    const employeeUpdated = await Employee.findOneAndUpdate({ user_id: userId }, employeeToUpdate, { new: true })

    return res.status(201).json({
      status: 'success',
      message: 'Employee updated successfully',
      data: {
        user_id: employeeUpdated.user_id,
        first_name: employeeUpdated.first_name,
        last_name: employeeUpdated.last_name,
        contact_number: employeeUpdated.contact_number,
        email: employeeUpdated.email,
        address: employeeUpdated.address,
        role: {
          role_name,
          role_permissions
        }
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the employee update process'
    })
  }
}
