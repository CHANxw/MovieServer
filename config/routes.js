var Index = require('../app/controllers/index') // 首页交互
var User = require('../app/controllers/user') // 用户信息交互
var Movie = require('../app/controllers/movie') // 电影信息交互
var Comment = require('../app/controllers/comment') // 评论信息交互
var Classify = require('../app/controllers/classify') // 分类信息交互
module.exports = function (app) {  // 在入口文件就能对接上app了
    // 编写路由
// views/index
    app.get('/', Index.index)


// views/list 电影列表
    app.get('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.list)
// views/detail 详情页
    app.get('/movie/:id', Movie.detail)
// views/admin录入页
    app.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new)
// POST的新添加的movie信息
    app.post('/admin/movie', User.signinRequired, User.adminRequired, Movie.savePoster, Movie.save)
//admin update movie 电影信息更新
    app.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update)
// delete movie 删除电影页
    app.delete('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.del)


// user signup 注册
    app.post('/user/signup', User.signup)
// user signin 登入
    app.post('/user/signin', User.signin)
// user signup 注册
    app.get('/signup', User.showSignup)
// user signin 登入
    app.get('/signin', User.showSignin)
// user logout 登出
    app.get('/logout', User.logout)
// admin/userlist 用户列表
    app.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list)


// comment 评论
// POST的新添加的comment信息
    app.post('/user/comment', User.signinRequired, Comment.save)

// 后台分类
    // 添加
    app.get('/admin/classify/new', User.signinRequired, User.adminRequired, Classify.new)
    // 保存
    app.post('/admin/classify', User.signinRequired, User.adminRequired, Classify.save)
    app.get('/admin/classify/list', User.signinRequired, User.adminRequired, Classify.list)

// 查询返回
    app.get('/results', Index.search)
}

