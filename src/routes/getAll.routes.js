import express from 'express'
import { getRows, appendData, clearData } from '../utils/GoogleAPI.js'
import addRebotado from '../services/Rebotado.js'
// const fs = require('fs')
import fs from 'fs'

const getAllRouter = express.Router()

getAllRouter.get('/', async (_req, res) => {
  // get the data from the data.txt file
  const data = fs.readFileSync('data.txt', 'utf8')
  const dataJSON = JSON.parse(data)

  return res.status(200).send({
    message: 'Success',
    length: dataJSON.length,
    values: dataJSON,
  })
})

getAllRouter.get('/:id', async (req, res) => {
  try {
    // get the data from the data.txt file
    const data = fs.readFileSync('data.txt', 'utf8')
    const dataJSON = JSON.parse(data)

    const id = req.params.id
    const index = dataJSON.findIndex((value) => value.id_orden == id)
    const sale = dataJSON[index]
    const associated = dataJSON.filter(
      (value) =>
        value.id_orden !== sale.id_orden &&
        ((value.mail !== '' && value.mail === sale.mail) ||
          (value.dni !== '' && value.dni === sale.dni))
    )

    if (index == -1) {
      return res.status(404).send({
        message: 'Error',
        error: 'No se encontró el ID',
      })
    }

    return res.status(200).send({
      message: 'Success',
      salesValue: sale,
      associatedSales: associated,
      associatedSales: associated,
    })
  } catch (error) {
    return res.status(404).send({
      message: 'Error',
      error: error,
    })
  }
})

getAllRouter.put('/', async (_req, res) => {
  const rows = await getRows('Cada Venta!A1:AK')
  const status = rows.status
  const values = rows.data.values

  const data = []

  for (let i = 1; i < values.length; i++) {
    console.log(i)
    let venta = {
      estado: values[i][0],
      fecha_compra: values[i][1],
      hora: values[i][2],
      id_orden: values[i][3],
      canal_venta: values[i][4],
      nombre: values[i][5],
      mail: values[i][6],
      dni: values[i][7],
      telefono: values[i][8],
      provincia: values[i][9],
      pais: values[i][10],
      tipo_envio: values[i][11],
      stock: values[i][12],
      metodo_pago: values[i][13],
      moneda: values[i][14],
      cupon: values[i][15],
      dcto_total: Number(
        values[i][16].replace('$', '').replace('.', '').replace(',', '.')
      ),
      dcto_cupon: Number(
        values[i][17].replace('$', '').replace('.', '').replace(',', '.')
      ),
      dcto_metodo_pago: Number(
        values[i][18].replace('$', '').replace('.', '').replace(',', '.')
      ),
      dcto_cantidad: Number(
        values[i][19].replace('$', '').replace('.', '').replace(',', '.')
      ),
      costo_envio: Number(
        values[i][20].replace('$', '').replace('.', '').replace(',', '.')
      ),
      // dejar los numeros como números, en lugar de "$ 1.000,00"
      ingresos_brutos: Number(
        values[i][21].replace('$', '').replace('.', '').replace(',', '.')
      ),
      ingresos_netos: Number(
        values[i][22].replace('$', '').replace('.', '').replace(',', '.')
      ),
      fecha_envio: values[i][23],
      fecha_pago: values[i][24],
      ref_externa: values[i][25],
      desconectados: values[i][26],
      destapados: values[i][27],
      año_nuevo: values[i][28],
      desconectados_2: values[i][29],
      combo_desc_dest: values[i][30],
      combo_desc_anuevo: values[i][31],
      total_desconectados: values[i][32],
      total_destapados: values[i][33],
      total_año_nuevo: values[i][34],
      cantidad_productos: values[i][35],
      total_juegos: values[i][36],
    }
    data.push(venta)
  }

  // Function to write in a txt file the data retrieved from the Google Sheet
  fs.writeFile('data.txt', JSON.stringify(data), (err) => {
    if (err) throw err
    console.log('The file has been saved!')
  })

  return res.status(200).send({
    message: 'Success',
    status: status,
    length: values.length,
    values: data,
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
