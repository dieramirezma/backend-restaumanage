/* eslint-disable camelcase */
import Table from '../models/table.js'
import { getRoleById } from '../services/roleService.js'
import mongoose from 'mongoose'

export const testTable = (req, res) => {
  res.send('Table controller works')
}

export const create = async (req, res) => {
  try {
    const table = req.body

    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('create_table') && role_name !== 'admin' && role_name !== 'employee') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to create a table'
      })
    }

    if (!table.table_number || !table.capacity || !table.location || !table.status) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      })
    }

    if (!['IN', 'OUT'].includes(table.location)) {
      return res.status(400).json({
        status: 'error',
        message: 'Location must be either IN or OUT'
      })
    }

    if (table.capacity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Capacity must be greater than 0'
      })
    }

    const newTable = new Table(table)

    const foundTable = await Table.findOne({ table_number: table.table_number })

    if (foundTable) {
      return res.status(409).json({
        status: 'error',
        message: 'Table already exists'
      })
    }

    await newTable.save()

    return res.status(201).json({
      status: 'success',
      message: 'Table created successfully',
      data: {
        table: newTable
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the table creation process'
    })
  }
}

export const update = async (req, res) => {
  try {
    const tableToUpdate = req.body

    const table_id = req.params.id

    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('update_table') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to update a table'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(table_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid table id'
      })
    }

    if (tableToUpdate.location && !['IN', 'OUT'].includes(tableToUpdate.location)) {
      return res.status(400).json({
        status: 'error',
        message: 'Location must be either IN or OUT'
      })
    }

    if (tableToUpdate.capacity && tableToUpdate.capacity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Capacity must be greater than 0'
      })
    }

    const foundTable = await Table.findById(table_id)

    if (!foundTable) {
      return res.status(404).json({
        status: 'error',
        message: 'Table not found'
      })
    }

    delete tableToUpdate.created_at
    delete tableToUpdate.__v
    delete tableToUpdate._id
    delete tableToUpdate.table_number

    const tableUpdated = await Table.findByIdAndUpdate(table_id, tableToUpdate, { new: true })

    return res.status(201).json({
      status: 'success',
      message: 'Table updated successfully',
      data: {
        table_number: tableUpdated.table_number,
        capacity: tableUpdated.capacity,
        location: tableUpdated.location
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the table update process'
    })
  }
}

export const getTables = async (req, res) => {
  try {
    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('list_tables') && role_name !== 'admin' && role_name !== 'customer' && role_name !== 'employee') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to list tables'
      })
    }

    const page = req.params.page ? parseInt(req.params.page, 10) : 1
    const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5

    const options = {
      page,
      limit: itemsPerPage,
      select: '-created_at -__v'
    }

    const tables = await Table.paginate({}, options)

    if (!tables || tables.docs.length === 0) {
      return res.status(404).send({
        status: 'error',
        message: 'No tables available'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Get tables successfully',
      data: {
        tables: tables.docs,
        totalDocs: tables.totalDocs,
        totalPages: tables.totalPages,
        page: tables.page,
        pagingCounter: tables.pagingCounter,
        hasPrevPage: tables.hasPrevPage,
        hasNextPage: tables.hasNextPage,
        prevPage: tables.prevPage,
        nextPage: tables.nextPage
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the get tables process'
    })
  }
}

export const getOneTable = async (req, res) => {
  try {
    const table_id = req.params.id

    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('get_table') && role_name !== 'admin' && role_name !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to get information from a table'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(table_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid table id'
      })
    }

    const foundTable = await Table.findById(table_id, '-created_at -__v')

    if (!foundTable) {
      return res.status(404).json({
        status: 'error',
        message: 'Table not found'
      })
    }

    return res.status(201).json({
      status: 'success',
      message: 'Get table information successfully',
      data: {
        table: foundTable
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the table get information process'
    })
  }
}

// TODO: Add update status table controller
export const updateStatus = async (req, res) => {
  try {
    const table_id = req.params.id

    const { roleId } = req.user

    const { role_name } = await getRoleById(roleId)

    if (role_name !== 'customer' && role_name !== 'admin' && role_name !== 'employee') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to update the table status'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(table_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid table id'
      })
    }

    const foundTable = await Table.findById(table_id)

    if (!foundTable) {
      return res.status(404).json({
        status: 'error',
        message: 'Table not found'
      })
    }

    const tableStatus = req.body.status

    if (!['Disponible', 'Reservada'].includes(tableStatus)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be either Disponible or Reservada'
      })
    }

    const tableUpdated = await Table.findByIdAndUpdate(table_id, { status: tableStatus }, { new: true })

    return res.status(201).json({
      status: 'success',
      message: 'Table status updated successfully',
      data: {
        table_number: tableUpdated.table_number,
        status: tableUpdated.status
      }
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error in the table status update process'
    })
  }
}
