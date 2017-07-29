// 负责与首页进行交互
var Movie = require('../models/movie')
var Classify = require('../models/classify')
// views/index
exports.index = function (req, res) {
    Classify
        .find({})
        .populate({path: 'movies', options: {limit: 5}}) // 获取movie下的数据然后限制个数
        .exec(function (err, classifys) {
            console.log(classifys)
            if (err) {
                console.log(err)
            }
            res.render('index', {
                title: '首页',
                classifys: classifys
            })
        })
}
exports.search = function (req, res) {
    var search = req.query.search
    var limit = 2
    if (search) {
        Classify.findOne({name: search}, function (err, classify) {
            if(!classify) {
                Movie.findOne({title: new RegExp(search + '.*','i')}, function (err, movie) {
                    // 对Search字段进行正则搜索,匹配字样信息
                    if(!movie) {
                        res.redirect('/')
                    } else {
                        res.redirect('/movie/' + movie._id)
                    }
                })
            } else {
                Movie.findPaginated({classify: classify._id}, function (err, result) {
                    if (err) console.log(err)
                    console.log(result)
                    res.render('results', {
                        title: '分类查询页',
                        movies: result.documents,
                        classifyId: classify._id,
                        name: classify.name,
                        currentPage: 1,
                        totalPages: result.totalPages,
                        prevPage: result.prevPage,
                        nextPage: result.nextPage
                    })
                }, limit, 1)
            }
        })
    } else {
        var classifyId = req.query.classify
        var name = req.query.name
        var page = req.query.p
        Movie.findPaginated({classify: classifyId}, function (err, result) {
            if (err) console.log(err)
            console.log(result)
            res.render('results', {
                title: '分类查询页',
                movies: result.documents,
                classifyId: classifyId,
                name: name,
                currentPage: page,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage
            })
        }, limit, page)
    }
}