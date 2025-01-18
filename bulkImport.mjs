/* global console process */
import fs from 'fs/promises'
import Typesense from 'typesense'
import 'dotenv/config'

const typesense = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: process.env.TYPESENSE_PORT,
      protocol: process.env.TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: process.env.TYPESENSE_APIKEY,
  numRetries: 3,
  connectionTimeoutMillis: 3000,
  __logLevel: 'debug',
})

const schema = {
  name: process.env.TYPESENSE_COLLECTION,
  num_documents: 0,
  fields: [
    {
      name: 'doc_id',
      type: 'string',
      facet: false,
    },
    {
      name: 'draft',
      type: 'string',
      facet: false,
      optional: true,
    },
    {
      name: 'title',
      type: 'string',
      facet: false,
    },
    {
      name: 'authors',
      type: 'string[]',
      facet: true,
      optional: true,
    },
    {
      name: 'format',
      type: 'string[]',
      facet: false,
      index: false,
      optional: true,
    },
    {
      name: 'page_count',
      type: 'string',
      facet: false,
      index: false,
      optional: true,
    },
    {
      name: 'pub_status',
      type: 'string',
      facet: false,
      optional: true,
    },
    {
      name: 'status',
      type: 'string',
      facet: true,
      optional: true,
    },
    {
      name: 'source',
      type: 'string',
      facet: true,
      optional: true,
    },
    {
      name: 'abstract',
      type: 'string',
      facet: false,
      optional: true,
    },
    {
      // TODO: some kind of date type, instead of string
      name: 'pub_date',
      type: 'string',
      facet: false,
      optional: true,
    },
    {
      name: 'keywords',
      type: 'string[]',
      facet: true,
      optional: true,
    },
    {
      name: 'obsoletes',
      type: 'string[]',
      facet: false,
      optional: true,
    },
    {
      name: 'obsoleted_by',
      type: 'string[]',
      facet: false,
      optional: true,
    },
    {
      name: 'updates',
      type: 'string[]',
      facet: false,
      optional: true,
    },
    {
      name: 'updated_by',
      type: 'string[]',
      facet: false,
      optional: true,
    },
    {
      name: 'see_also',
      type: 'string[]',
      facet: false,
      optional: true,
    },
    {
      name: 'doi',
      type: 'string',
      facet: false,
      optional: true,
    },
    {
      name: 'errata_url',
      type: 'string',
      facet: false,
      index: false,
      optional: true,
    },
    {
      name: 'content',
      type: 'string',
      facet: false,
      optional: true,
    },
  ],
}

async function fillCollection() {
  try {
    await typesense.collections(process.env.TYPESENSE_COLLECTION).delete()
  } catch (err) {
    console.error(err)
  }
  try {
    await typesense.collections().create(schema)
    const collection = typesense.collections(process.env.TYPESENSE_COLLECTION)
    const files = await fs.readdir('public/rfcs')
    // This: files.forEach(async (file) => {
    // produces a 'too many open files' error, because JavaScirpt is a steaming pile of shite
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(`public/rfcs/${file}`, 'utf-8')
        const obj = JSON.parse(data)
        try {
          const content = await fs.readFile(
            `public/rfcs/${file.replace(/\.json$/, '.txt')}`,
            'utf-8',
          )
          obj.content = content
        } catch (err) {
          // File doesn't exist probably
          console.error(err)
        }
        console.log(`Importing ${file}`)
        await collection.documents().create(obj)
      }
    }
  } catch (err) {
    console.error(err)
  }
}

fillCollection()
