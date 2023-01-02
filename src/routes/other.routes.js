import express from 'express'
import { getRows, appendData, clearData } from '../utils/GoogleAPI.js'

const otherRouter = express.Router()

const genereteId = () => {
  const month = new Date().toLocaleString('es-AR', { month: '2-digit' })
  const year = new Date().toLocaleString('es-AR', { year: 'numeric' })
  const date = new Date().toLocaleString('es-AR', { day: '2-digit' })
  const random = Math.floor(Math.random() * 1000)
  const id = `${month}${year}${date}${random}`

  return id
}

otherRouter.get('/', async (req, res) => {})

otherRouter.post('/mayorista', async (req, res) => {
  const rows = await getRows('Mayoristas!A2:A')
  const status = rows.status
  const values = rows.data.values
  const from = values.length + 2

  const date = new Date().toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const {
    fecha_compra,
    canal_venta,
    nombre,
    mail,
    dni,
    telefono,
    zip_code,
    ciudad,
    provincia,
    pais,
    tipo_envio,
    stock,
    metodo_pago,
    moneda,
    fecha_envio,
    fecha_pago,
    costo_envio,
  } = req.body

  const productos = req.body.productos

  const append = []

  const id = genereteId()

  for (let i = 0; i < productos.length; i++) {
    const thisRow = []
    thisRow.push('Finalizada')
    if (fecha_compra === '') {
      thisRow.push(date)
    } else {
      thisRow.push(fecha_compra)
    }
    thisRow.push('')
    thisRow.push(
      `=SI.ERROR(""&IFS(REGEXMATCH(E${from + i};"Reventa");"REV-";REGEXMATCH(E${
        from + i
      };"Empresa");"EMP-")&""&F${from + i}&"";"")`
    )
    thisRow.push(canal_venta)
    thisRow.push(id)
    thisRow.push(nombre)
    thisRow.push(mail)
    thisRow.push(dni)
    thisRow.push(telefono)
    thisRow.push(productos[i].nombre)
    thisRow.push(productos[i].cantidad)
    thisRow.push(zip_code)
    thisRow.push(ciudad)
    thisRow.push(provincia)
    thisRow.push(pais)
    thisRow.push(tipo_envio)
    thisRow.push(stock)
    thisRow.push(metodo_pago)
    thisRow.push(moneda)
    thisRow.push(productos[i].precio)
    thisRow.push(`=U${from + i}*L${from + i}`)
    thisRow.push('')
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    if (i === 0) {
      thisRow.push(costo_envio)
    } else {
      thisRow.push(0)
    }

    thisRow.push('1')
    thisRow.push(`=V${from + i}+AH${from + i}`)
    thisRow.push(`=AJ${from + i}-SUMAPRODUCTO($X${from + i}:$AG${from + i})`)
    thisRow.push(fecha_envio)
    thisRow.push(fecha_pago)
    thisRow.push(fecha_pago)
    thisRow.push('Entregado')

    append.push(thisRow)
  }

  const range = `Mayoristas!A${from}:AO${from}`
  await clearData(range)
  setTimeout(async () => {
    await appendData(range, append)
  }, 1000)

  return res.status(200).send({
    message: 'Success',
    data: append,
  })
})

otherRouter.post('/personal', async (req, res) => {
  const rows = await getRows('Personales!A2:A')
  const status = rows.status
  const values = rows.data.values
  const from = values.length + 2
  console.log('from', from)

  const date = new Date().toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const {
    fecha_compra,
    canal_venta,
    nombre,
    mail,
    dni,
    telefono,
    zip_code,
    ciudad,
    provincia,
    pais,
    tipo_envio,
    stock,
    metodo_pago,
    moneda,
    fecha_envio,
    fecha_pago,
    dcto_cupon,
    dcto_metodo_pago,
    dcto_cantidad,
    costo_MP,
    iva,
    ganancias,
    sirtac,
    otrosImp,
    plataforma,
    costo_envio,
  } = req.body

  const productos = req.body.productos

  const append = []

  const id = genereteId()

  for (let i = 0; i < productos.length; i++) {
    const thisRow = []
    thisRow.push('Finalizada')
    if (fecha_compra === '') {
      thisRow.push(date)
    } else {
      thisRow.push(fecha_compra)
    }
    thisRow.push('')
    thisRow.push(
      `=SI.ERROR(""&IFS(REGEXMATCH(E${from};"Personal");"PE-";REGEXMATCH(E${from};"Tienda Nube");"TN-")&""&F${from}&"";"")`
    )
    thisRow.push(canal_venta)
    thisRow.push(id)
    thisRow.push(nombre)
    thisRow.push(mail)
    thisRow.push(dni)
    thisRow.push(telefono)
    thisRow.push(productos[i].nombre)
    thisRow.push(productos[i].cantidad)
    thisRow.push(zip_code)
    thisRow.push(ciudad)
    thisRow.push(provincia)
    thisRow.push(pais)
    thisRow.push(tipo_envio)
    thisRow.push(stock)
    thisRow.push(metodo_pago)
    thisRow.push(moneda)
    thisRow.push(productos[i].precio)
    thisRow.push(`=U${from + i}*L${from + i}`)
    thisRow.push('')
    if (i === 0) {
      thisRow.push(dcto_cupon + dcto_metodo_pago + dcto_cantidad)
      thisRow.push(dcto_cupon)
      thisRow.push(dcto_metodo_pago)
      thisRow.push(dcto_cantidad)
      thisRow.push(costo_MP)
      thisRow.push(iva)
      thisRow.push(ganancias)
      thisRow.push(sirtac)
      thisRow.push(otrosImp)
      thisRow.push(plataforma)
      thisRow.push(costo_envio)
    } else {
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
    }

    thisRow.push('1')
    thisRow.push(`=V${from}+AH${from}`)
    thisRow.push(`=AJ${from}-SUMAPRODUCTO($X${from}:$AG${from})`)
    thisRow.push(fecha_envio)
    thisRow.push(fecha_pago)
    thisRow.push(fecha_pago)
    thisRow.push('Entregado')

    append.push(thisRow)
  }

  const range = `Personales!A${from}:AO${from}`
  await clearData(range)
  setTimeout(async () => {
    await appendData(range, append)
  }, 1000)

  return res.status(200).send({
    message: 'Success',
    data: append,
  })
})

otherRouter.post('/regalo', async (req, res) => {
  const rows = await getRows('Regalos!A2:A')
  const status = rows.status
  const values = rows.data.values
  const from = values.length + 2
  console.log('from', from)

  const date = new Date().toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const {
    fecha_compra,
    nombre,
    mail,
    dni,
    telefono,
    zip_code,
    ciudad,
    provincia,
    pais,
    tipo_envio,
    stock,
    fecha_envio,
  } = req.body

  const productos = req.body.productos

  const append = []

  const id = genereteId()

  for (let i = 0; i < productos.length; i++) {
    const thisRow = []
    thisRow.push('Finalizada')
    if (fecha_compra === '') {
      thisRow.push(date)
    } else {
      thisRow.push(fecha_compra)
    }
    thisRow.push('')
    thisRow.push(
      `=SI.ERROR(""&IFS(REGEXMATCH(E${from};"Regalo");"RG-")&""&F${from}&"";"")`
    )
    thisRow.push('Regalo')
    thisRow.push(id)
    thisRow.push(nombre)
    thisRow.push(mail)
    thisRow.push(dni)
    thisRow.push(telefono)
    thisRow.push(productos[i].nombre)
    thisRow.push(productos[i].cantidad)
    thisRow.push(zip_code)
    thisRow.push(ciudad)
    thisRow.push(provincia)
    thisRow.push(pais)
    thisRow.push(tipo_envio)
    thisRow.push(stock)
    thisRow.push('Regalado')
    thisRow.push('ARS')
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push('')
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push('1')
    thisRow.push(0)
    thisRow.push(0)
    thisRow.push(fecha_envio)
    thisRow.push(fecha_compra)
    thisRow.push(fecha_compra)
    thisRow.push('Entregado')

    append.push(thisRow)
  }

  const range = `Regalos!A${from}:AO${from}`
  await clearData(range)
  setTimeout(async () => {
    await appendData(range, append)
  }, 1000)

  return res.status(200).send({
    message: 'Success',
    data: append,
  })
})

export default otherRouter
