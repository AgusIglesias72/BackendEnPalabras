import express from 'express'
import { getStockMeli, getStockShipNow } from '../services/Stock.js'
import { getToken } from '../services/MELIOrder.js'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const stockRouter = express.Router()

const meliDesconectadosId = 'GTXC88781'
const meliDestapadosId = 'OAEI04349'

const shipnowDesconectadosId = '2987377'
const shipnowDestapadosId = '3492014'
const shipnowDesconectados30Id = '3730771'
const shipnowDestapados30Id = '3730775'

stockRouter.get('/', async (_req, res) => {
  const token = await getToken()

  try {
    const meliDesconectados = await getStockMeli(token, meliDesconectadosId)
    const meliDestapados = await getStockMeli(token, meliDestapadosId)

    const shipnowDesconectados = await getStockShipNow(shipnowDesconectadosId)
    const shipnowDestapados = await getStockShipNow(shipnowDestapadosId)
    const shipnowDesconectados30 = await getStockShipNow(
      shipnowDesconectados30Id
    )
    const shipnowDestapados30 = await getStockShipNow(shipnowDestapados30Id)

    const stock = {
      MercadoLibre: {
        Desconectados: meliDesconectados.available_quantity,
        Destapados: meliDestapados.available_quantity,
      },
      ShipNow: {
        Desconectados: {
          Disponibles: shipnowDesconectados.available,
          Preparacion: shipnowDesconectados.committed,
          PorDespachar: shipnowDesconectados.allocated,
        },
        Destapados: {
          Disponibles: shipnowDestapados.available,
          Preparacion: shipnowDestapados.committed,
          PorDespachar: shipnowDestapados.allocated,
        },
        '30_Desconectados': {
          Disponibles: shipnowDesconectados30.available,
          Preparacion: shipnowDesconectados30.committed,
          PorDespachar: shipnowDesconectados30.allocated,
        },
        '30_Destapados': {
          Disponibles: shipnowDestapados30.available,
          Preparacion: shipnowDestapados30.committed,
          PorDespachar: shipnowDestapados30.allocated,
        },
      },
    }
    res.status(200).send(stock)
  } catch (error) {
    res.status(500).send(error)
  }
})

export default stockRouter
