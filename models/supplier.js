import { Schema, model } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const SupplierSchema = Schema({
  supplier_name: {
    type: String,
    required: true
  },
  contact_person: {
    type: String,
    required: true
  },
  contact_number: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

// Add pagination plugin
SupplierSchema.plugin(mongoosePaginate)

export default model('Supplier', SupplierSchema, 'suppliers')
