import express from 'express'
import tnRouter from './src/routes/tiendanube.routes.js'
import meliRouter from './src/routes/mercadolibre.routes.js'
import stockRouter from './src/routes/stock.routes.js'
import getAllRouter from './src/routes/getAll.routes.js'
import otherRouter from './src/routes/other.routes.js'

const app = express()

app.use(express.json())

const PORT = process.env.PORT ?? 3000

app.get('/', async (_req, res) => {
  res.send('Helloonp World!')
})

app.use('/api/tn', tnRouter)
app.use('/api/meli', meliRouter)
app.use('/api/stock', stockRouter)
app.use('/api/all', getAllRouter)
app.use('/api/other', otherRouter)

app.listen(PORT, () => {
  console.log(`Server running port ${PORT}`)
})
