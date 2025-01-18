/* global process */
import mojo from '@mojojs/core'
import 'dotenv/config'
//import Typesense from 'typesense'

//const typesense = new Typesense.Client({
//  nodes: [
//    {
//      host: process.env.TYPESENSE_HOST,
//      port: process.env.TYPESENSE_PORT,
//      protocol: process.env.TYPESENSE_PROTOCOL,
//    },
//  ],
//  apiKey: 'abc',
//  numRetries: 3,
//  connectionTimeoutMillis: 3000,
//  logLevel: 'debug',
//})

const app = mojo()

//app.post('/multi_search_alternative', async (ctx) => {
//  const searchRequest = await ctx.req.json()
//  const searchResults = await typesense
//    .collections('rfcs')
//    .documents()
//    .search(searchRequest.searches[0])
//  ctx.render({ json: { results: [searchResults] } })
//})

app.post('/multi_search', async (ctx) => {
  const url = `${process.env.TYPESENSE_PROTOCOL}://${process.env.TYPESENSE_HOST}:${process.env.TYPESENSE_PORT}/multi_search?x-typesense-api-key=${process.env.TYPESENSE_APIKEY}`
  const res = await ctx.ua.post(url, {
    json: await ctx.req.json(),
  })
  const data = await res.json()
  ctx.render({ json: data })
})

app.get('/', (ctx) => {
  ctx.render({ view: 'index' })
})

app.start()
