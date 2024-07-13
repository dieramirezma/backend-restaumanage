/* eslint-disable camelcase */
import mongoose from 'mongoose'
import Inventory from '../models/inventory.js'
import { getRoleById } from '../services/roleService.js'

export const testInventory = (req, res) => {
  res.send('Inventory controller works')
}

export const create = async (req, res) => {
  try {
    const item = req.body

    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('create_inventory') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to create an inventory item'
      })
    }

    if (!item.item_name || !item.quantity || !item.unit || !item.reorder_level || !item.supplier_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      })
    }

    if (item.quantity <= 0 || item.reorder_level <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity and reorder level must be greater than 1 or equal'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(item.supplier_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid supplier ID'
      })
    }

    if (!item.item_description) delete item.item_description

    const itemInventory = new Inventory(item)

    const foundItem = await Inventory.findOne({
      $and: [
        { supplier_id: itemInventory.supplier_id },
        { item_name: itemInventory.item_name }
      ]
    })

    if (foundItem) {
      return res.status(409).json({
        status: 'error',
        message: 'Item inventory already exists'
      })
    }

    await itemInventory.save()

    return res.status(201).json({
      status: 'success',
      message: 'Item inventory created successfully',
      data: {
        item_inventory: itemInventory
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the item inventory creation process'
    })
  }
}
