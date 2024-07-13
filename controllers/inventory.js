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

    if (item.quantity < 0 || item.reorder_level < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity and reorder level must be greater than 0 or equal'
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

export const updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body
    const itemId = req.params.id

    if (!quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide the quantity to update'
      })
    }

    if (quantity < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity must be greater than 0 or equal'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid item ID'
      })
    }

    const itemToUpdate = await Inventory.findByIdAndUpdate(itemId, { quantity }, { new: true })

    if (!itemToUpdate) {
      return res.status(404).json({
        status: 'error',
        message: 'Item inventory not found'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Item inventory updated successfully',
      data: {
        item_inventory: itemToUpdate
      }
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error in the item inventory update process'
    })
  }
}

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid item ID'
      })
    }

    const itemToDelete = await Inventory.findByIdAndDelete(id)

    if (!itemToDelete) {
      return res.status(404).json({
        status: 'error',
        message: 'Item inventory not found'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Item inventory deleted successfully',
      data: {
        item_inventory: itemToDelete
      }
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error in the item inventory deletion process'
    })
  }
}

export const getInventoryItems = async (req, res) => {
  try {
    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('list_inventory_items') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to list inventory items'
      })
    }

    const page = req.params.page ? parseInt(req.params.page, 10) : 1
    const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5

    const options = {
      page,
      limit: itemsPerPage,
      select: '-created_at -__v',
      populate: {
        path: 'supplier_id',
        select: '-created_at -__v'
      }
    }

    const items = await Inventory.paginate({}, options)

    if (!items || items.docs.length === 0) {
      return res.status(404).send({
        status: 'error',
        message: 'No inventory items available'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Get inventory items successfully',
      data: {
        inventory_item: items.docs,
        totalDocs: items.totalDocs,
        totalPages: items.totalPages,
        page: items.page,
        pagingCounter: items.pagingCounter,
        hasPrevPage: items.hasPrevPage,
        hasNextPage: items.hasNextPage,
        prevPage: items.prevPage,
        nextPage: items.nextPage
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the get inventory items process'
    })
  }
}

export const getOneInventoryItem = async (req, res) => {
  try {
    const { id } = req.params

    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('get_inventory_item') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to get information from an inventory item'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid supplier id'
      })
    }

    const foundItem = await Inventory.findById(id, '-created_at -__v').populate({
      path: 'supplier_id',
      select: '-created_at -__v'
    })

    if (!foundItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Inventory item not found'
      })
    }

    return res.status(201).json({
      status: 'success',
      message: 'Get inventory item information successfully',
      data: {
        inventory_item: foundItem
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the get inventory item information process'
    })
  }
}
