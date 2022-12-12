import express from 'express'
import { getRows, appendData, clearData } from '../utils/GoogleAPI.js'
import { getOrders } from '../services/TNOrder.js'
import addRebotado from '../services/Rebotado.js'

const getAllRouter = express.Router()

getAllRouter.post('/', async (_req, res) => {
  await clearData('Hoja 13!A2:AQ')

  const tn_data = await getRows('Tienda Nube!A2:AQ')
  const meli_data = await getRows('Mercado Libre!A2:AQ')
  const may_data = await getRows('Mayoristas!A2:AQ')
  const personales_data = await getRows('Personales!A2:AQ')
  const regalos_data = await getRows('Regalos!A2:AQ')

  let tn_values = tn_data.data.values
  let meli_values = meli_data.data.values
  let may_values = may_data.data.values
  let personales_values = personales_data.data.values
  let regalos_values = regalos_data.data.values

  await appendData('Hoja 13!A2', tn_values)
  await appendData('Hoja 13!A2', meli_values)
  await appendData('Hoja 13!A2', may_values)
  await appendData('Hoja 13!A2', personales_values)
  await appendData('Hoja 13!A2', regalos_values)

  return res.status(200).send({
    message: 'Success',
  })
})

getAllRouter.post('/:id', async (req, res) => {
  const id = req.params.id
  addRebotado(id)

  return res.status(200).send({
    message: 'Success',
  })
})

export default getAllRouter
