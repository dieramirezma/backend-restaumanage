import { Schema, model } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const EmployeeSchema = Schema({
  user_id: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  contact_number: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  role_id: {
    type: Schema.ObjectId,
    ref: 'Role',
    required: true
  },
  hire_date: {
    type: Date,
    default: Date.now
  },
  payroll: {
    salary: {
      type: Number,
      required: true
    },
    bonuses: {
      type: Number
    }
  },
  schedule: [{
    day: {
      type: String,
      required: true
    },
    start_time: {
      type: String,
      required: true
    },
    end_time: {
      type: String,
      required: true
    }
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
})

// Add pagination plugin
EmployeeSchema.plugin(mongoosePaginate)

export default model('Employee', EmployeeSchema, 'employees')
