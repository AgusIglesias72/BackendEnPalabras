import express from 'express'
import { getRows, appendData, clearData } from '../utils/GoogleAPI.js'
import { getToken, getOrders } from '../services/MELIOrder.js'
import dotenv from 'dotenv'

dotenv.config()

const meliRouter = express.Router()

const getTwoDaysBefore = () => {
  const today = new Date()
  let from = new Date()
  from.setDate(today.getDate() - 2)
  from.toDateString()
  from = from.toISOString().split('T')[0]
  return from
}

meliRouter.get('/', async (_req, res) => {})

meliRouter.post('/', async (_req, res) => {
  const token = await getToken()

  const from = getTwoDaysBefore()
  const rows = await getRows('Mercado Libre!AT2:AT')
  const status = rows.status
  const values = rows.data.values
  let data
  let index
  if (status === 200) {
    if (values && values.length > 0) {
      index = values.findIndex((value) => value[0] == [from]) + 2
      const range = `Mercado Libre!AT${index}:CM`
      if (index > 1) {
        await clearData(range)
      }
    }
    data = await getOrders(token, from)

    const append = await appendData('Mercado Libre!AT2', data)
    return res.status(200).send({
      message: 'Success',
      updatedRows: data.length,
      updatedSales: new Set(data.map((sale) => sale[0])).size,
      data: data,
      googleStatus: append,
    })
  } else {
    res.status(404).send('Not found')
  }
})

meliRouter.post('/:date', async (req, res) => {
  const token = await getToken()
  const date = req.params.date
  let from = getTwoDaysBefore()
  if (date && date.length === 10 && date.includes('-')) {
    from = date
  }

  const rows = await getRows('Mercado Libre!AT2:AT')
  const status = rows.status
  const values = rows.data.values

  let data
  let index
  if (status === 200) {
    if (values && values.length > 0) {
      index = values.findIndex((value) => value[0] == [from]) + 2
      const range = `Mercado Libre!AT${index}:CM`
      if (index > 1) {
        await clearData(range)
      }
    }
    data = await getOrders(token, from)

    const append = await appendData('Mercado Libre!AT2', data)
    return res.status(200).send({
      message: 'Success',
      updatedRows: data.length,
      updatedSales: new Set(data.map((sale) => sale[0])).size,
      data: data,
      googleStatus: append,
    })
  } else {
    res.status(404).send('Not found')
  }
})

meliRouter.post('/:date', async (req, res) => {
  res.send('Hello World!')
})

export default meliRouter
