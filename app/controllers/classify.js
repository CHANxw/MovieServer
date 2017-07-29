// 负责评论信息相关的交互
var Classify = require('../models/classify')

// POST的新添加的classify信息
exports.save = function (req, res) {
    var _classify = req.body.classify
    // var name = _classify.name
    Classify.findOne({name: _classify.name}, function (err, classify) {
        if (classify) {
            res.redirect('/admin/classify/list')
        } else {
            new Classify(_classify).save(function(err, classify){
                if (err) {
                    console.log(err)
                }
                res.redirect('/admin/classify/list')
            })
        }
    })
}
exports.new = function (req, res) {
    res.render('classifyAdmin', {
        title: '分类录入页',
        classify: {}
    })
}
exports.list = function (req, res) {
    Classify.fetch(function (err, classify) {
        if (err) {
            console.log(err)
        }
        res.render('classifyList', {
            title: '分类列表',
            classify: classify
        })
    })

}
