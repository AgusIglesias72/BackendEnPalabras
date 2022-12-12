import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const getToken = async () => {
  let url = `https://api.mercadolibre.com/oauth/token?grant_type=refresh_token&client_id=${process.env.AUTH_MELI_CLIENT_ID}&client_secret=${process.env.AUTH_MELI_CLIENT_SECRET}&refresh_token=${process.env.AUTH_MELI_REFRESH_TOKEN}`

  const res = await axios.post(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  return res.data.access_token
}

const getIds = async (token, from) => {
  const header = {
    Authorization: `Bearer ${token}`,
  }
  const ids = []

  for (let i = 0; i < 2800; i += 50) {
    const response = await axios.get(
      `https://api.mercadolibre.com/orders/search?seller=701499356&offset=${i}&limit=50&order.date_closed.from=${from}T00:00:00.000-03:00`,
      { headers: header }
    )
    response.data.results.forEach((order) => {
      ids.push(order.id)
    })
  }
  return ids
}

const getShips = async (token, id) => {
  const header = {
    Authorization: `Bearer ${token}`,
  }

  // let response
  // try {
  //   while (true) {
  //     response = await axios.get(
  //       `https://api.mercadolibre.com/shipments/${id}`,
  //       {
  //         headers: header,
  //       }
  //     )
  //     if (response.status === 200) {
  //       break
  //     }
  //   }
  // } catch (error) {
  //   console.log('No se pudo obtener el envío', id)
  // }
  const ship_data = []

  if (id) {
    const response = await axios.get(
      `https://api.mercadolibre.com/shipments/${id}`,
      { headers: header }
    )
    let res
    if (response) {
      res = response.data
    }

    ship_data.push(
      res.shipping_option.cost.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      })
    )
    ship_data.push(
      res.base_cost.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      })
    )
    ship_data.push(
      res.cost_components.loyal_discount.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      })
    )
    try {
      ship_data.push(res.logistic_type)
      ship_data.push(res.status)
      ship_data.push(res.receiver_address.state.name)
      ship_data.push(res.receiver_address.city.name)
      ship_data.push(res.receiver_address.zip_code)
    } catch (error) {
      ship_data.push('')
      ship_data.push('')
      ship_data.push('')
      ship_data.push('')
      ship_data.push('')
    }

    res.status_history.date_shipped
      ? ship_data.push(
          new Date(res.status_history.date_shipped).toLocaleString('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
          })
        )
      : ship_data.push('No enviado')
    res.status_history.date_delivered
      ? ship_data.push(
          new Date(res.status_history.date_delivered).toLocaleString('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
          })
        )
      : ship_data.push('No entregado')
    res.status_history.date_not_delivered
      ? ship_data.push(
          new Date(res.status_history.date_not_delivered).toLocaleString(
            'es-AR',
            {
              timeZone: 'America/Argentina/Buenos_Aires',
            }
          )
        )
      : ship_data.push('')
  } else if (!id) {
    ship_data.push('')
    ship_data.push('')
    ship_data.push('')
    ship_data.push('')
    ship_data.push('')
    ship_data.push('')
    ship_data.push('')
    ship_data.push('')
    ship_data.push('')
    ship_data.push('')
    ship_data.push('')
  }

  return ship_data
}

const getMP = async (id) => {
  const mp_head = {
    Accept: 'application/json',
    Authorization: process.env.AUTH_MERCADOPAGO,
  }
  const mp_data = []

  let mp_cost = 0
  let iva = 0
  let ganancias = 0
  let sirtac = 0
  let otrosImp = 0
  let tiendaFee = 0
  let daterelease = ''
  let cuotas = 0
  let received = 0

  let res
  while (true) {
    res = await axios.get(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${id}`,
      { headers: mp_head }
    )
    if (res.data.results.length > 0) {
      break
    }
  }

  // const res = await axios.get(
  //   `https://api.mercadopago.com/v1/payments/search?external_reference=${id}`,
  //   { headers: mp_head }
  // )

  res.data.results.forEach((item) => {
    if (item.status === 'approved') {
      received = item.transaction_details.net_received_amount
      const chargeDetails = item.charges_details
      chargeDetails.forEach((charge) => {
        if (charge.name === 'tax_withholding-retencion_ganancias') {
          ganancias += charge.amounts.original
        }
        if (charge.name === 'meli_fee') {
          mp_cost += charge.amounts.original
        }
        if (charge.name === 'third_payment') {
          tiendaFee += charge.amounts.original
        }
        if (charge.name === 'tax_withholding-retencion_iva') {
          iva += charge.amounts.original
        }
        if (charge.name.includes('sirtac')) {
          sirtac += charge.amounts.original
        } else if (
          charge.name !== 'coupon_off' &&
          charge.name !== 'shp_fulfillment' &&
          charge.name !== 'meli_fee' &&
          charge.name !== 'tax_withholding-retencion_iva' &&
          !charge.name.includes('sirtac')
        ) {
          otrosImp += charge.amounts.original
        }
      })
      cuotas = item.installments
      if (item.money_release_date) {
        daterelease = new Date(item.money_release_date).toLocaleString(
          'es-AR',
          {
            timeZone: 'America/Argentina/Buenos_Aires',
          }
        )
      }
    }
  })

  mp_data.push(
    mp_cost.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )
  mp_data.push(
    iva.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )
  mp_data.push(
    ganancias.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )
  mp_data.push(
    sirtac.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )
  mp_data.push(
    otrosImp.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )
  mp_data.push(
    tiendaFee.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )
  mp_data.push(daterelease)
  mp_data.push(cuotas)
  mp_data.push(
    received.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )

  return mp_data
}

const getOrders = async (token, from) => {
  const header = {
    Authorization: `Bearer ${token}`,
  }
  const orders = []
  const ids = await getIds(token, from)

  for (let i = 0; i < ids.length; i++) {
    let response
    let response_dni

    while (true) {
      response = await axios.get(
        `https://api.mercadolibre.com/orders/${ids[i]}`,
        { headers: header }
      )
      response_dni = await axios.get(
        `https://api.mercadolibre.com/orders/${ids[i]}/billing_info`,
        { headers: header }
      )

      if (response.status === 200 && response_dni.status === 200) {
        break
      }
      if (response.status === 200 && response_dni.status === 204) {
        response_dni = {
          data: { billing_info: { doc_number: '' } },
        }
        break
      }
    }
    // const response = await axios.get(
    //   `https://api.mercadolibre.com/orders/${ids[i]}`,
    //   { headers: header }
    // )
    // const response_dni = await axios.get(
    //   `https://api.mercadolibre.com/orders/${ids[i]}/billing_info`,
    //   { headers: header }
    // )
    const res = response.data
    const res_dni = response_dni.data

    const date_usformat = new Date(res.date_created).toLocaleString('sv-SE', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
    const order_id = res.id
    const date_created = new Date(res.date_created).toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
    const buyer_name = `${res.buyer.first_name} ${res.buyer.last_name}`
    const dni = res_dni.billing_info.doc_number
    const currency_id = res.currency_id
    const shipping_id = res.shipping.id
    const paid_amount = res.paid_amount
    const status = res.status
    const buyer_nick = res.buyer.nickname
    const buyer_id = res.buyer.id
    const pack_id = res.pack_id

    const ship_data = await getShips(token, shipping_id)
    const mp_data = await getMP(order_id)

    res.order_items.forEach((item) => {
      console.log(date_created, order_id, buyer_name)
      const product = []
      product.push(`=LEFTB("${date_usformat}";10)`)
      product.push(`="${order_id}"`)
      product.push(date_created)
      product.push(buyer_name)
      product.push(dni)
      product.push(item.item.title)
      product.push(
        item.full_unit_price.toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
        })
      )
      product.push(item.quantity)
      product.push(currency_id)
      product.push(`="${shipping_id}"`)
      product.push(status)
      product.push(buyer_nick)
      product.push(`="${buyer_id}"`)
      product.push(`="${pack_id}"`)

      ship_data.forEach((data) => {
        product.push(data)
      })
      mp_data.forEach((data) => {
        product.push(data)
      })
      orders.push(product)
    })
  }
  return orders
}

export { getToken, getOrders }
