import { Schema, model } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const InventoryTransactionsSchema = Schema({
  inventory_id: {
    type: Schema.ObjectId,
    required: true
  },
  transaction_type: {
    type: String, // Can be 'IN' or 'OUT'
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  transaction_date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

// Add pagination plugin
InventoryTransactionsSchema.plugin(mongoosePaginate)

export default model('User', InventoryTransactionsSchema, 'users')
