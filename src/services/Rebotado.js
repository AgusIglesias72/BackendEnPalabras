import { appendData, getRows } from '../utils/GoogleAPI.js'

const addRebotado = async (number) => {
  const rows = await getRows('Rebotados!E:E')
  const status = rows.status
  const values = rows.data.values
  if (status === 200) {
    const index = values.findIndex((value) => value[0] == [number])
    if (index === -1) {
      const data = [number]
      const append = await appendData(`Rebotados!E${values.length + 1}`, [data])
      return append
    } else {
      return 'Already exists'
    }
  } else {
    return 'Error'
  }
}

export default addRebotado

// Esto debería funcionar, pero todavía no lo chequeé. Habría que completar con funciones Buscar en Sheets.
