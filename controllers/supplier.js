/* eslint-disable camelcase */
import mongoose from 'mongoose'
import Supplier from '../models/supplier.js'
import { getRoleById } from '../services/roleService.js'

export const testSupplier = (req, res) => {
  res.send('Supplier controller works')
}

export const create = async (req, res) => {
  try {
    const {
      supplier_name,
      contact_person,
      contact_number,
      address
    } = req.body

    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('create_supplier') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to create a supplier'
      })
    }

    if (!supplier_name || !contact_person || !contact_number || !address) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      })
    }

    const supplier = new Supplier({
      supplier_name,
      contact_person,
      contact_number,
      address
    })

    const foundSupplier = await Supplier.findOne({
      $or: [
        { supplier_name: supplier.supplier_name },
        { contact_number: supplier.contact_number }
      ]
    })

    if (foundSupplier) {
      return res.status(409).json({
        status: 'error',
        message: 'Supplier already exists'
      })
    }

    await supplier.save()

    return res.status(201).json({
      status: 'success',
      message: 'Supplier created successfully',
      data: {
        supplier
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the supplier creation process'
    })
  }
}

export const update = async (req, res) => {
  try {
    const supplierToUpdate = req.body

    const supplier_id = req.params.id

    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('update_supplier') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to update a supplier'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(supplier_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid supplier id'
      })
    }

    const foundSupplier = await Supplier.findById(supplier_id)

    if (!foundSupplier) {
      return res.status(404).json({
        status: 'error',
        message: 'Supplier not found'
      })
    }

    delete supplierToUpdate.created_at
    delete supplierToUpdate.__v
    delete supplierToUpdate._id

    const supplierUpdated = await Supplier.findByIdAndUpdate(supplier_id, supplierToUpdate, { new: true })

    return res.status(201).json({
      status: 'success',
      message: 'Supplier updated successfully',
      data: {
        supplier_name: supplierUpdated.supplier_name,
        contact_person: supplierUpdated.contact_person,
        contact_number: supplierUpdated.contact_number,
        address: supplierUpdated.address
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the supplier update process'
    })
  }
}

export const getSuppliers = async (req, res) => {
  try {
    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('list_supplier') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to list suppliers'
      })
    }

    const page = req.params.page ? parseInt(req.params.page, 10) : 1
    const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5

    const options = {
      page,
      limit: itemsPerPage,
      select: '-created_at -__v'
    }

    const suppliers = await Supplier.paginate({}, options)

    if (!suppliers || suppliers.docs.length === 0) {
      return res.status(404).send({
        status: 'error',
        message: 'No suppliers available'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Get suppliers successfully',
      data: {
        suppliers: suppliers.docs,
        totalDocs: suppliers.totalDocs,
        totalPages: suppliers.totalPages,
        page: suppliers.page,
        pagingCounter: suppliers.pagingCounter,
        hasPrevPage: suppliers.hasPrevPage,
        hasNextPage: suppliers.hasNextPage,
        prevPage: suppliers.prevPage,
        nextPage: suppliers.nextPage
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the get suppliers process'
    })
  }
}

export const getOneSupplier = async (req, res) => {
  try {
    const supplier_id = req.params.id

    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('get_supplier') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to get information from a supplier'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(supplier_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid supplier id'
      })
    }

    const foundSupplier = await Supplier.findById(supplier_id, '-created_at -__v')

    if (!foundSupplier) {
      return res.status(404).json({
        status: 'error',
        message: 'Supplier not found'
      })
    }

    return res.status(201).json({
      status: 'success',
      message: 'Get supplier information successfully',
      data: {
        supplier: foundSupplier
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the supplier get information process'
    })
  }
}
