import { Schema, model } from 'mongoose'

const RoleSchema = Schema({
  role_name: {
    type: String,
    required: true
  },
  permissions: {
    type: [String],
    required: true
  }
})

export default model('Role', RoleSchema, 'roles')
