import axios from 'axios'
import dotenv from 'dotenv'
import { appendData } from '../utils/GoogleAPI.js'
import addRebotado from './Rebotado.js'

dotenv.config()

const header = {
  'Content-Type': 'application/json',
  Authentication: process.env.AUTH_TIENDANUBE,
  'User-Agent': 'En Palabras (enpalabrass@gmail.com)',
}

const getIds = async (from) => {
  const ids = []

  for (let i = 1; i < 15; i++) {
    console.log(i)
    const response = await axios.get(
      `https://api.tiendanube.com/v1/1705915/orders?fields=id,number&page=${i}&per_page=200`,
      { headers: header }
    )

    response.data.forEach((order) => {
      if (order.number >= from) {
        ids.unshift(order.id)
      }
    })
  }
  return ids
}

const getShip = async (id) => {
  const ship_head = {
    accept: 'application/json',
    Authorization: process.env.AUTH_SHIPNOW,
  }
  const ship_data = []

  try {
    const response = await axios.get(
      `https://api.shipnow.com.ar/orders?external_reference=${id}`,
      { headers: ship_head }
    )
    const res = response.data

    let shipped = ''
    let ship_status = res.results[0].status
    let delivered_at = ''

    if (res.results[0] && res.results[0].timestamps.shipped_at) {
      shipped = new Date(res.results[0].timestamps.shipped_at).toLocaleString(
        'es-AR',
        {
          timeZone: 'America/Argentina/Buenos_Aires',
        }
      )
    }
    if (res.results[0] && res.results[0].timestamps.delivered_at) {
      delivered_at = new Date(
        res.results[0].timestamps.delivered_at
      ).toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      })
    }
    ship_data.push(shipped)
    ship_data.push(ship_status)
    ship_data.push(delivered_at)
  } catch (error) {
    console.log(error)
    ship_data.push('')
    ship_data.push('')
    ship_data.push('')
  }

  return ship_data
}

const getMp = async (value, gateway) => {
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

  if (gateway === 'Mercado Pago') {
    const res = await axios.get(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${value}`,
      { headers: mp_head }
    )
    res.data.results.forEach((item) => {
      if (item.status === 'approved') {
        received = item.transaction_details.net_received_amount
        const feeDetails = item.fee_details
        feeDetails.forEach((detail) => {
          if (detail.type === 'mercadopago_fee') {
            mp_cost += detail.amount
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
                charge.name !== 'tax_withholding-retencion_iva'
              ) {
                otrosImp += charge.amounts.original
              }
            })
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
  }

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

const getTN = async (id) => {
  while (true) {
    const res = await axios.get(
      `https://api.tiendanube.com/v1/1705915/orders/${id}`,
      { headers: header }
    )
    if (res.status === 200) {
      return res
    }
  }
}

const getOrders = async (from) => {
  const ids = await getIds(from)
  const container = []

  for (let i = 0; i < ids.length; i++) {
    const order = []
    const id = ids[i]
    const response = await getTN(id)
    const res = response.data
    const ship = await getShip(id)

    const number = res.number
    const status = res.status
    const date = new Date(res.created_at).toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    const paymentStatus = res.payment_status
    const payDate = res.paid_at
    const shipStatus = res.shipping_status
    const shipDate = res.shipped_at
    const orderId = res.id
    const shipCost = res.shipping_cost_customer.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
    const currency = res.currency
    const gateway = res.gateway_name

    const mp = await getMp(orderId, gateway)

    console.log(number)

    let name = ''
    let email = ''
    let phone = ''
    let dni = ''

    try {
      name = res.customer.name
      email = res.customer.email
      dni = res.customer.identification
      phone = res.customer.phone
        .replace('+', '')
        .replace(' ', '')
        .toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
        })
    } catch (error) {
      name = res.shipping_address.name
      phone = res.billing_phone
    }

    const shipType = res.shipping_pickup_type
    const shipDetail = res.shipping_option

    const totalDiscount = res.discount.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
    let quantityDiscount = 0
    try {
      quantityDiscount =
        res.promotional_discount.promotions_applied[0].total_discount_amount.replace(
          '.',
          ','
        )
    } catch (error) {
      quantityDiscount = 0
    }
    const paymentDiscount = res.discount_gateway
    // .toLocaleString('es-AR', {
    //   timeZone: 'America/Argentina/Buenos_Aires',
    // })
    const cuponDiscount = res.discount_coupon.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    let cupon = ''
    if (res.coupon[0]) {
      cupon = res.coupon[0].code
    }

    const shipAddress = res.shipping_address.address
    const shipNumber = res.shipping_address.number
    const shipFloor = res.shipping_address.floor
    const shipLocality = res.shipping_address.locality
    const shipZipCode = res.shipping_address.zipcode
    const shipCity = res.shipping_address.city
    const shipProvince = res.shipping_address.province
    const shipCountry = res.shipping_address.country

    res.products.forEach((item) => {
      const product = []
      product.push(number)
      product.push(date)
      product.push(name)
      product.push(email)
      product.push(dni)
      product.push(phone)
      product.push(status)

      product.push(shipType)
      product.push(shipDetail)
      product.push(gateway)
      product.push(currency)
      product.push(item.name)
      product.push(item.price.replace('.', ','))
      product.push(item.quantity)
      product.push(totalDiscount.replace('.', ','))
      product.push(quantityDiscount)
      product.push(paymentDiscount.replace('.', ','))
      product.push(cuponDiscount.replace('.', ','))
      product.push(cupon)
      product.push(shipCost.replace('.', ','))
      product.push(shipAddress)
      product.push(shipNumber)
      product.push(shipFloor)
      product.push(shipLocality)
      product.push(shipCity)
      product.push(shipProvince)
      product.push(shipCountry)
      product.push(shipZipCode)

      product.push(paymentStatus)
      product.push(payDate)
      product.push(shipStatus)
      product.push(shipDate)
      product.push(orderId)

      ship.forEach((item) => {
        product.push(item)
      })
      mp.forEach((item) => {
        product.push(item)
      })
      container.push(product)
    })

    if (ship[1] === 'not_delivered') {
      console.log(ship[1])
      addRebotado(number)
    }
  }
  return container
}

export { getOrders }
