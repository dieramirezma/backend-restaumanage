import { Schema, model } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

// TODO: Add Category field
const InventorySchema = Schema({
  item_name: {
    type: String,
    required: true
  },
  item_description: {
    type: String
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  reorder_level: {
    type: Number,
    required: true
  },
  supplier_id: {
    type: Schema.ObjectId,
    ref: 'Supplier',
    required: true
  },
  category: {
    type: String,
    required: true
  }
})

// Add pagination plugin
InventorySchema.plugin(mongoosePaginate)

export default model('Inventory', InventorySchema, 'inventories')
