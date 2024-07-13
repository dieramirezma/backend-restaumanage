import { Schema, model } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const ReservationSchema = Schema({
  user_id: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  customer_name: {
    type: String,
    required: true
  },
  customer_contact: {
    type: String,
    required: true
  },
  table_id: {
    type: Schema.ObjectId,
    ref: 'Table',
    required: true
  },
  reservation_date: {
    type: Date,
    required: true
  },
  number_of_people: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

// Add pagination plugin
ReservationSchema.plugin(mongoosePaginate)

export default model('Reservation', ReservationSchema, 'reservations')
