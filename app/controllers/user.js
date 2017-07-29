// 负责用户信息交互
var User = require('../models/user')

exports.signup = function (req, res) {
    var _user = req.body.user
    // 查找有无重复
    User.findOne({name: _user.name}, function (err, user) {
        if (err) {
            console.log(err)
        }
        if (user) {
            console.log('用户名重复')
            return res.redirect('/')  // 账号存在就返回首页
        } else {
            var user = new User(_user)
            user.save(function (err, user) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(user)
                    res.redirect('/')
                }
            })
        }
    })
}
// user signin
exports.signin = function (req, res) {
    var _user = req.body.user
    var name = _user.name
    var password = _user.password
    User.findOne({name: name}, function (err, user) {
        if (err) {
            console.log(err)
        }
        if (!user) {
            return res.redirect('/signin')
        }
        user.comparePassword(password, function (err, truely) {
            if (err) {
                console.log(err)
            }
            if (truely) {
                req.session.user = user
                console.log('登陆成功')
                return res.redirect('/')
            } else {
                return res.redirect('/signin')
                console.log('Password is not true')
            }
        })
    })
}
// user logout
exports.logout = function (req, res) {
    delete req.session.user
    res.redirect('/')
}
// admin/userlist
exports.list = function (req, res) {
    var user = req.session.user
    if (!user) {
        return res.redirect('/') // 用户没登录不让进
    }
    User.fetch(function (err, users) {
        if (err) {
            console.log(err)
        }
        res.render('userlist', {
            title: '用户列表',
            users: users
        })
    })

}
// show signin
exports.showSignin = function (req, res) {
    res.render('signin', {
        title: '登录页面',
    })
}
// show signup
exports.showSignup = function (req, res) {
    res.render('signup', {
        title: '注册页面',
    })
}
// 用户登录要求设置
exports.signinRequired = function (req, res, next) {
    var user = req.session.user
    if (!user) {
        return res.redirect('/signin')
    }
    next()  // 通过就执行下一个命令
}
// 用户权限要求设置midware for user
exports.adminRequired = function (req, res, next) {
    var user = req.session.user
    if (!user.role) {
        user.role = 0
    }
    if (user.role <= 10) {
        return res.redirect('/')
    }
    next() // 通过就执行下一个命令
}
