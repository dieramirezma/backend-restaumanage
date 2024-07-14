/* eslint-disable camelcase */
import Inventory_Transaction from '../models/inventory_transaction.js'
import { getRoleById } from '../services/roleService.js'
import mongoose from 'mongoose'

export const testInventoryTransaction = (req, res) => {
  res.send('Inventory transaction controller works')
}

export const register = async (req, res) => {
  try {
    const item = req.body

    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('register_inventory_transaction') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to register an inventory transaction'
      })
    }

    if (!item.inventory_id || !item.transaction_type || !item.quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      })
    }

    if (item.quantity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity and reorder level must be greater than 1 or equal'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(item.inventory_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid inventory item ID'
      })
    }

    if (!['IN', 'OUT'].includes(item.transaction_type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Transaction type must be either IN or OUT'
      })
    }

    if (!item.notes) delete item.notes

    const itemTransaction = new Inventory_Transaction(item)

    await itemTransaction.save()

    return res.status(201).json({
      status: 'success',
      message: 'Inventory transaction registered successfully',
      data: {
        item_transaction: itemTransaction
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the inventory transaction registration process'
    })
  }
}

export const getTransactions = async (req, res) => {
  try {
    const { roleId } = req.user

    const { role_name, role_permissions } = await getRoleById(roleId)

    if (!role_permissions.includes('list_transactions') && role_name !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to list transactions of inventory items'
      })
    }

    const page = req.params.page ? parseInt(req.params.page, 10) : 1
    const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5

    const options = {
      page,
      limit: itemsPerPage,
      select: '-created_at -__v',
      populate: {
        path: 'inventory_id',
        select: '-created_at -__v'
      }
    }

    const transactions = await Inventory_Transaction.paginate({}, options)

    if (!transactions || transactions.docs.length === 0) {
      return res.status(404).send({
        status: 'error',
        message: 'No transactions of inventory items available'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Get transactions of inventory items successfully',
      data: {
        transactions: transactions.docs,
        totalDocs: transactions.totalDocs,
        totalPages: transactions.totalPages,
        page: transactions.page,
        pagingCounter: transactions.pagingCounter,
        hasPrevPage: transactions.hasPrevPage,
        hasNextPage: transactions.hasNextPage,
        prevPage: transactions.prevPage,
        nextPage: transactions.nextPage
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the get transactions of inventory items process'
    })
  }
}
