import { Schema, model } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const TableSchema = Schema({
  table_number: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  location: {
    type: String, // Inside, Outside, VIP
    required: true
  }
})

// Add pagination plugin
TableSchema.plugin(mongoosePaginate)

export default model('Table', TableSchema, 'tables')
