import { Schema, model } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const UserSchema = Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Schema.ObjectId,
    ref: 'Role',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

// Add pagination plugin
UserSchema.plugin(mongoosePaginate)

export default model('User', UserSchema, 'users')
