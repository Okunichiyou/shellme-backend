import { Hono } from 'hono'
import priceTagApp from './parse-price-tag'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Cloudflare!')
})

app.route('/api', priceTagApp)

export default app
