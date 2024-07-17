/* eslint-disable camelcase */
import { getRoleById } from '../services/roleService.js'
import Employee from '../models/employee.js'
import mongoose from 'mongoose'

export const testEmployee = (req, res) => {
  res.send('Employee controller works')
}

export const create = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      contact_number,
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

    if (!first_name || !last_name || !contact_number) {
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

export const getEmployees = async (req, res) => {
  try {
    const { roleId } = req.user

    const { role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('list_employees') && !role_permissions.includes('all')) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to list employees'
      })
    }

    const page = req.params.page ? parseInt(req.params.page, 10) : 1
    const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5

    const options = {
      page,
      limit: itemsPerPage,
      select: '-created_at -__v',
      populate: [
        {
          path: 'role_id',
          select: '-_id -__v -created_at'
        },
        {
          path: 'user_id',
          select: '-__v -created_at -password -role_id'
        }
      ]
    }

    const employees = await Employee.paginate({}, options)

    if (!employees || employees.docs.length === 0) {
      return res.status(404).send({
        status: 'error',
        message: 'No employees available'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Get employees successfully',
      data: {
        employees: employees.docs,
        totalDocs: employees.totalDocs,
        totalPages: employees.totalPages,
        page: employees.page,
        pagingCounter: employees.pagingCounter,
        hasPrevPage: employees.hasPrevPage,
        hasNextPage: employees.hasNextPage,
        prevPage: employees.prevPage,
        nextPage: employees.nextPage
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the get employees process'
    })
  }
}

export const updatePayroll = async (req, res) => {
  try {
    const { roleId } = req.user
    const { id } = req.params
    const { salary, bonuses } = req.body

    const { role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('update_payroll') && !role_permissions.includes('all')) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update payroll'
      })
    }

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide an employee id'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee id'
      })
    }

    if (!salary) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a salary'
      })
    }

    const employee = await Employee.findByIdAndUpdate(id, { payroll: { salary, bonuses } }, { new: true })

    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Update payroll successfully',
      data: {
        first_name: employee.first_name,
        last_name: employee.last_name,
        salary: employee.payroll.salary,
        bonuses: employee.payroll.bonuses
      }
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error in the update payroll process'
    })
  }
}

export const updateSchedule = async (req, res) => {
  try {
    const { roleId } = req.user
    const { id } = req.params
    const { schedule } = req.body

    const { role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('update_schedule') && !role_permissions.includes('all')) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update schedule'
      })
    }

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide an employee id'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee id'
      })
    }

    if (!schedule) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a schedule'
      })
    }

    const employee = await Employee.findByIdAndUpdate(id, { schedule }, { new: true })

    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Update schedule successfully',
      data: {
        first_name: employee.first_name,
        last_name: employee.last_name,
        schedule: employee.schedule
      }
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error in the update schedule process'
    })
  }
}

export const getPayroll = async (req, res) => {
  try {
    const { userId } = req.user

    const employee = await Employee.findOne({ user_id: userId })

    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Get payroll successfully',
      data: {
        first_name: employee.first_name,
        last_name: employee.last_name,
        salary: employee.payroll.salary,
        bonuses: employee.payroll.bonuses
      }
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error in the get payroll process'
    })
  }
}

export const getSchedule = async (req, res) => {
  try {
    const { userId } = req.user

    const employee = await Employee.findOne({ user_id: userId })

    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Get schedule successfully',
      data: {
        first_name: employee.first_name,
        last_name: employee.last_name,
        schedule: employee.schedule
      }
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error in the get schedule process'
    })
  }
}

export const getOnlyEmployee = async (req, res) => {
  try {
    const employee_id = req.params.id

    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('get_employee') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to get information from a employee'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(employee_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid supplier id'
      })
    }

    const foundEmployee = await Employee.findById(employee_id, '-created_at -__v').populate([
      {
        path: 'role_id',
        select: '-_id -__v -created_at'
      },
      {
        path: 'user_id',
        select: '-__v -created_at -password -role_id'
      }
    ])

    if (!foundEmployee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      })
    }

    return res.status(201).json({
      status: 'success',
      message: 'Get employee information successfully',
      data: {
        employee: foundEmployee
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the employee get information process'
    })
  }
}
