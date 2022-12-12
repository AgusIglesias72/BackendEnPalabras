import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const getStockMeli = async (token, id) => {
  const url = `https://api.mercadolibre.com/inventories/${id}/stock/fulfillment`
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

const getStockShipNow = async (id) => {
  const url = `https://api.shipnow.com.ar/variants/${id}`
  const response = await axios.get(url, {
    headers: {
      Authorization: `${process.env.AUTH_SHIPNOW}`,
    },
  })

  return response.data.stock
}

export { getStockMeli, getStockShipNow }
