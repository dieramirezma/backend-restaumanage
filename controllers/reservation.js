/* eslint-disable camelcase */
import mongoose from 'mongoose'
import Reservation from '../models/reservation.js'
import { getRoleById } from '../services/roleService.js'

export const testReservation = (req, res) => {
  res.send('Reservation controller works')
}

export const create = async (req, res) => {
  try {
    const reservation = req.body

    const { roleId, userId } = req.user

    const { role_name } = await getRoleById(roleId)

    if (role_name !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to create a reservation'
      })
    }

    if (!reservation.customer_name || !reservation.customer_contact || !reservation.table_id || !reservation.reservation_date || !reservation.number_of_people) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(reservation.table_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid table id'
      })
    }

    // Validate date
    reservation.reservation_date = new Date(reservation.reservation_date)

    if (reservation.reservation_date < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date'
      })
    }

    const newReservation = new Reservation({ ...reservation, user_id: userId })

    const foundReservation = await Reservation.findOne({
      $and: [
        { table_id: reservation.table_id },
        { reservation_date: reservation.reservation_date }
      ]
    })

    if (foundReservation) {
      return res.status(409).json({
        status: 'error',
        message: 'Reservation already exists'
      })
    }

    await newReservation.save()

    return res.status(201).json({
      status: 'success',
      message: 'Reservation created successfully',
      data: {
        reservation: newReservation
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the reservation creation process'
    })
  }
}

export const deleteReservation = async (req, res) => {
  try {
    const reservation_id = req.params.id

    const { roleId } = req.user

    const { role_name } = await getRoleById(roleId)

    if (role_name !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to delete a reservation'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(reservation_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reservation id'
      })
    }

    const foundReservation = await Reservation.findByIdAndDelete(reservation_id)

    if (!foundReservation) {
      return res.status(404).json({
        status: 'error',
        message: 'Reservation not found'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Reservation deleted successfully',
      data: {
        reservation: foundReservation
      }
    })
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Error in the reservation deletion process'
    })
  }
}

export const getReservations = async (req, res) => {
  try {
    const { roleId } = req.user

    const { role_name } = await getRoleById(roleId)

    if (role_name !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to delete a reservation'
      })
    }

    const page = req.params.page ? parseInt(req.params.page, 10) : 1
    const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5

    const options = {
      page,
      limit: itemsPerPage,
      select: '-created_at -__v',
      populate: {
        path: 'table_id',
        select: '-created_at -__v'
      }
    }

    const reservations = await Reservation.paginate({}, options)

    if (!reservations || reservations.docs.length === 0) {
      return res.status(404).send({
        status: 'error',
        message: 'No reservations available'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Get reservations successfully',
      data: {
        reservations: reservations.docs,
        totalDocs: reservations.totalDocs,
        totalPages: reservations.totalPages,
        page: reservations.page,
        pagingCounter: reservations.pagingCounter,
        hasPrevPage: reservations.hasPrevPage,
        hasNextPage: reservations.hasNextPage,
        prevPage: reservations.prevPage,
        nextPage: reservations.nextPage
      }
    })
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Error in the get reservations process'
    })
  }
}

export const getOneReservation = async (req, res) => {
  try {
    const reservation_id = req.params.id

    const { roleId } = req.user

    const { role_name } = await getRoleById(roleId)

    if (role_name !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to delete a reservation'
      })
    }

    if (!mongoose.Types.ObjectId.isValid(reservation_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reservation id'
      })
    }

    const foundReservation = await Reservation.findById(reservation_id)
      .populate({
        path: 'table_id',
        select: '-created_at -__v'
      })

    if (!foundReservation) {
      return res.status(404).json({
        status: 'error',
        message: 'Reservation not found'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Reservation get successfully',
      data: {
        reservation: foundReservation
      }
    })
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Error in the reservation get process'
    })
  }
}
