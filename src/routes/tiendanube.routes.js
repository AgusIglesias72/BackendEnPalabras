import express from 'express'
import { getRows, appendData, clearData } from '../utils/GoogleAPI.js'
import { getOrders } from '../services/TNOrder.js'

const tnRouter = express.Router()

const columns = [
  { estado_orden: 'A' },
  { fecha_compra: 'B' },
  { hora_compra: 'C' },
  { id_orden: 'D' },
  { canal_venta: 'E' },
  { id_orden_venta: 'F' },
  { nombre_completo: 'G' },
  { mail: 'H' },
  { dni: 'I' },
  { telefono: 'J' },
  { producto: 'K' },
  { cantidad_juegos: 'L' },
  { zip_code: 'M' },
  { ciudad: 'N' },
  { provincia: 'O' },
  { pais: 'P' },
  { tipo_envio: 'Q' },
  { stock: 'R' },
  { metodo_pago: 'S' },
  { moneda: 'T' },
  { precio_unit_prod: 'U' },
  { precio_total_prod: 'V' },
  { cupon_dcto: 'W' },
  { dcto_total: 'X' },
  { dcto_cupon: 'Y' },
  { dcto_metodo_pago: 'Z' },
  { dcto_cantidad: 'AA' },
  { costo_MP: 'AB' },
  { iva: 'AC' },
  { ganancias: 'AD' },
  { sirtac: 'AE' },
  { otros: 'AF' },
  { plataforma: 'AG' },
  { costo_envio: 'AH' },
  { cuotas: 'AI' },
  { ingresos_brutos: 'AJ' },
  { ingresos_netos: 'AK' },
  { fecha_envio: 'AL' },
  { fecha_pago: 'AM' },
  { fecha_liquidacion: 'AN' },
  { rebotado: 'AO' },
  { factura: 'AP' },
  { id_ref_extra: 'AQ' },
]

tnRouter.get('/', async (req, res) => {
  const rows = await getRows('Tienda Nube!AT2:AT')
  const status = rows.status
  const values = rows.data.values

  if (status === 200) {
    const id = req.params.id
    const index = values.findIndex((value) => value[0] == [id]) + 2
    res.status(status).send({
      index,
    })
  } else {
    res.status(404).send('Not found')
  }
})

tnRouter.post('/', async (_req, res) => {
  const rows = await getRows('Tienda Nube!AT2:AT')
  const status = rows.status
  const values = rows.data.values
  let data
  if (status === 200 && values && values.length > 0) {
    const max = Math.max(...values.map((value) => value[0]))
    data = await getOrders(max + 1)
  }
  try {
    const append = await appendData('Tienda Nube!AT2', data)
    return res.status(200).send({
      message: 'Success',
      updatedRows: data.length,
      updatedSales: new Set(data.map((sale) => sale[0])).size,
      data: data,
      googleStatus: append,
    })
  } catch (error) {
    console.log(error)
  }
})

tnRouter.post('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const rows = await getRows('Tienda Nube!AU2:AU')
    const status = rows.status
    const values = rows.data.values
    let data
    if (status === 200) {
      if (values && values.length > 0) {
        const index = values.findIndex((value) => value[0] == [id]) + 2
        const range = `Tienda Nube!AU${index}:CM`
        if (index > 1) {
          await clearData(range)
          data = await getOrders(id)
        }
        if (index === 1) {
          const max = Math.max(...values.map((value) => value[0]))
          console.log('max', max)
          data = await getOrders(max + 1)
        }
      } else if (!values) {
        data = await getOrders(id)
      }
    }

    const append = await appendData('Tienda Nube!AU2', data)
    return res.status(200).send({
      message: 'Success',
      updatedRows: data.length,
      updatedSales: new Set(data.map((sale) => sale[0])).size,
      data: data,
      googleStatus: append,
    })
  } catch (error) {
    console.log(error)
  }
})

tnRouter.put('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const column = req.body.column
    const value = req.body.value

    const columnletter = columns.find((col) => col[column])[column]

    const rows = await getRows('Tienda Nube!F2:F')
    const status = rows.status
    const values = rows.data.values
    const update = []
    if (status === 200) {
      if (values && values.length > 0) {
        values.map((value) => {
          if (value[0] == [id]) {
            update.push(values.indexOf(value) + 2)
          }
        })
      }
      for (let i = 0; i < update.length; i++) {
        const range = `Tienda Nube!${columnletter}${update[i]}`
        await clearData(range)
        setTimeout(async () => {
          await appendData(range, [[value]])
        }, 1000)
      }
    }

    return res.status(200).send({
      message: 'Success',
      updatedRows: update,
      value,
    })
  } catch (error) {
    console.log(error)
  }
})

export default tnRouter
