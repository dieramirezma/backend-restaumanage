/* eslint-disable camelcase */
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

    const foundSupplier = await Supplier.findOne({ supplier_name })

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
