const express = require('express')               // 載入 express
const app = express()                            // 建立 express instance
const mongoose = require('mongoose')

// 引用 express-handlebars
const exphbs = require('express-handlebars')

// 引用 body-parser
const bodyParser = require('body-parser')
// 設定 bodyParser
app.use(bodyParser.urlencoded({ extended: true }))

// 告訴 express 使用 handlebars 當作 template engine 並預設 layout 是 main
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(express.static('public'))

mongoose.connect('mongodb://localhost/restaurant', { useNewUrlParser: true, useUnifiedTopology: true })

// mongoose 連線後透過 mongoose.connection 拿到 Connection 的物件
const db = mongoose.connection

// 連線異常
db.on('error', () => {
  console.log('mongodb error!')
})

// 連線成功
db.once('open', () => {
  console.log('mongodb connected!')
})

// 載入 restaurant model
const Restaurant = require('./models/restaurant.js')

// 設定路由
// Restaurant 首頁
app.get('/', (req, res) => {
  Restaurant.find((err, restaurants) => {
    if (err) return console.error(err)
    return res.render('index', { restaurants: restaurants })
  })
})
// 列出全部 Restaurant
app.get('/restaurants', (req, res) => {
  return res.redirect('/')
})
// 新增一筆 Restaurant 頁面
app.get('/restaurants/new', (req, res) => {
  return res.render('new')
})
// 顯示一筆 Restaurant 的詳細內容
app.get('/restaurants/:id', (req, res) => {
  Restaurant.findById(req.params.id, (err, restaurant) => {
    if (err) return console.error(err)
    return res.render('show', { restaurant: restaurant })
  })
})
// 新增一筆 Restaurant
app.post('/restaurants', (req, res) => {
  const restaurant = new Restaurant({
    name: req.body.name,
    name_en: req.body.name_en,
    category: req.body.category,
    image: req.body.image,
    location: req.body.location,
    phone: req.body.phone,
    google_map: req.body.google_map,
    rating: req.body.rating,
    description: req.body.description
  })

  restaurant.save(err => {
    if (err) return console.error(err)
    return res.redirect('/')
  })
})
// 修改 Restaurant 頁面
app.get('/restaurants/:id/edit', (req, res) => {
  Restaurant.findById(req.params.id, (err, restaurant) => {
    if (err) return console.error(err)
    return res.render('edit', { restaurant: restaurant })
  })
})
// 修改 Restaurant
app.post('/restaurants/:id/edit', (req, res) => {
  Restaurant.findById(req.params.id, (err, restaurant) => {
    if (err) return console.error(err)
    restaurant.name = req.body.name
    restaurant.name_en = req.body.name_en
    restaurant.category = req.body.category
    restaurant.image = req.body.image
    restaurant.location = req.body.location
    restaurant.phone = req.body.phone
    restaurant.google_map = req.body.google_map
    restaurant.rating = req.body.rating
    restaurant.description = req.body.description
    restaurant.save(err => {
      if (err) return console.error(err)
      return res.redirect(`/restaurants/${req.params.id}`)
    })
  })
})
// 刪除 Restaurant
app.post('/restaurants/:id/delete', (req, res) => {
  Restaurant.findById(req.params.id, (err, restaurant) => {
    if (err) return console.error(err)
    restaurant.remove(err => {
      if (err) return console.error(err)
      return res.redirect('/')
    })
  })
})

// 搜尋 Restaurant
app.get('/search', (req, res) => {
  const keywordRegex = new RegExp(req.query.keyword, 'i')
  Restaurant.find(
    {
      $or: [
        { name: { $regex: keywordRegex, $options: "$i" } },
        { category: { $regex: keywordRegex } }
      ]
    },
    (err, restaurants) => {
      if (err) return console.error(err)
      return res.render('index', { restaurants, keyword: req.query.keyword })
    })
})

// 設定 express port 3000
app.listen(3000, () => {
  console.log('App is running')
})