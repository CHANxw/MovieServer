var express = require('express')
var port = process.env.PORT || 3000 // 定义端口
var app = express() // 实例
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var connectMultiparty = require('connect-multiparty') // 分隔上传
var dbUrl = 'mongodb://localhost/movie'
var logger = require('morgan')  // 将操作响应到操作台上

// session 储存
var session = require('express-session') // 设置session 也可以使用cookies-session插件，持久化的方式不同
var mongoStore = require('connect-mongo')(session)
mongoose.Promise = global.Promise

app.use(session({
    secret: 'movie',
    store: new mongoStore({
        url: dbUrl,
        collection: 'sessions',
    }),
    resave: false,
    saveUninitialized: true
}))
app.set('views', './app/views/pages') // 设置视图的根目录
app.set('view engine', 'pug') // 设置模板引擎
app.listen(port) // 监听端口
app.use('/static', express.static('static')) // 配置公共模块
app.use(bodyParser.urlencoded({extended: true})) // 对请求body进行格式化

app.use(connectMultiparty()) // 分隔上传
// 判断session有无信息
app.use(function (req, res, next) {
    console.log(req.session.user)
    var _user = req.session.user
    app.locals.user = _user
    return next()
})
mongoose.connect(dbUrl, {useMongoClient: true}) // 连接数据库


console.log('监听' + port + '端口')

// morgan
if('development' === app.get('env')) {
    app.set('showStaceError', true) // 这样就能打印错误到屏幕上
    app.use(logger(':method :url :status'))
    app.locals.pretty = true // 压缩后使得代码更好看些
    mongoose.set('debug', true)
}

// 引入时间模块
app.locals.moment = require('moment')
// 引入路由
require('./config/routes')(app)