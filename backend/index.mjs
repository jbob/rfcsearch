/* global process */
import mojo from '@mojojs/core'

import dotenv from 'dotenv'
dotenv.config({
  path: '../.env',
})

import { Sequelize, DataTypes } from 'sequelize'
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storate: ':memory:',
  logging: false,
})
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})
const Bookmark = sequelize.define('Bookmark', {
  number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})
User.hasMany(Bookmark)
Bookmark.belongsTo(User)

await sequelize.sync({ force: true })

const app = mojo()

app.post('/multi_search', async (ctx) => {
  const typesense_protocol = process.env.TYPESENSE_PROTOCOL || 'http'
  const typesense_host = process.env.TYPESENSE_HOST || 'localhost'
  const typesense_port = process.env.TYPESENSE_PORT || '8108'
  const typesense_apikey = process.env.TYPESENSE_APIKEY || 'xyz'

  const url = `${typesense_protocol}://${typesense_host}:${typesense_port}/multi_search?x-typesense-api-key=${typesense_apikey}`
  const res = await ctx.ua.post(url, {
    json: await ctx.req.json(),
  })
  const data = await res.json()
  return ctx.render({ json: data })
})

app.get('/login', async (ctx) => {
  return await ctx.render({ view: 'login' })
})

app.post('/login', async (ctx) => {
  const params = await ctx.params()
  const email = params.get('email')
  const password = params.get('password')
  if (!email || !password) {
    const flash = await ctx.flash()
    flash.confirmation = 'email of password field empty'
    return await ctx.redirectTo('/login')
  }
  const user = await User.findOne({ where: { email: email } })
  if (password !== user?.password) {
    const flash = await ctx.flash()
    flash.confirmation = 'invalid login'
    return await ctx.redirectTo('/login')
  }
  const session = await ctx.session()
  session.email = email
  return await ctx.redirectTo('/')
})

app.get('/register', async (ctx) => {
  return await ctx.render({ view: 'register' })
})

app.post('/register', async (ctx) => {
  const params = await ctx.params()
  const email = params.get('email')
  const password = params.get('password')
  const password_confirm = params.get('password_confirm')
  if (password !== password_confirm) {
    const flash = await ctx.flash()
    flash.confirmation = 'passwords do not match'
    return await ctx.redirectTo('/register')
  }
  const user_check = await User.findOne({ where: { email: email } })
  if (user_check) {
    const flash = await ctx.flash()
    flash.confirmation = 'user already exists'
    return await ctx.redirectTo('/register')
  }
  const user = await User.create({ email: email, password: password })
  const session = await ctx.session()
  session.email = email
  await ctx.redirectTo('/')
})

app.post('/api/bookmarks', async (ctx) => {
  const param = await ctx.req.json()
  const hitId = param.id
  const session = await ctx.session()
  const email = session.email
  if (!email) {
    return await ctx.render({ text: '401 Unauthorized', status: 401 })
  }
  const user = await User.findOne({ where: { email: email } })
  if (!user) {
    return await ctx.render({ text: '404 User Not Found', status: 404 })
  }
  const existingBookmark = await Bookmark.findOne({
    where: {
      number: hitId,
      UserId: user.id, // Ensure we only check this user's bookmarks
    },
  })
  if (existingBookmark) {
    await existingBookmark.destroy()
  } else {
    await user.createBookmark({ number: hitId })
  }

  const updatedBookmarks = await user.getBookmarks()
  const bookmarkIds = updatedBookmarks.map((b) => b.number)
  return await ctx.render({ json: { bookmarks: bookmarkIds } })
})

app.get('/', async (ctx) => {
  const session = await ctx.session()
  const email = session.email
  let bookmarks = []
  console.log(email)
  if (email) {
    const user = await User.findOne({ where: { email: email } })
    bookmarks = await user.getBookmarks()
  }
  ctx.stash.userBookmarks = JSON.stringify(bookmarks.map((b) => b.number))
  return await ctx.render({ view: 'index' })
})

app.start()
