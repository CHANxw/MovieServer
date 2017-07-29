// 负责电影信息相关的交互
var Movie = require('../models/movie')
var Comment = require('../models/comment')
var Classify = require('../models/classify')
var _ = require('underscore')
var fs = require('fs')
var path = require('path')

// views/list
exports.list = function (req, res) {
    var classify = req.query.classify
    console.log(classify)
    if (classify) {
        Classify
            .findOne({_id: classify})
            .populate('movies', 'title year country director') // 获取movie下的数据然后限制个数
            .exec(function (err, classify) {
                console.log('-----------------')
                console.log(classify)
                console.log('-----------------')
                if (err) {
                    console.log(err)
                }
                res.render('list', {
                    title: classify.name,
                    movies: classify.movies
                })
            })
    } else {
        Movie.fetch(function (err, movies) {
            if (err) {
                console.log(err)
            }
            res.render('list', {
                title: '电影列表',
                movies: movies
            })
        })
    }
}
// views/detail
exports.detail = function (req, res) {
    var id = req.params.id
    console.log('------detail movie id--------')
    console.log(id)
    console.log('--------------')
    Movie.update(id, {$inc:{pv:1}},function (err) {  // $inc设置的值是增加值，pv:1也就是pv+=1
        if(err) console.log(err)
    })
    Movie.findById(id, function (err, movie) {
        if (err) {
            console.log(err)
        }
        Comment
            .find({movie: id}) // 返回id电影
            .populate('from', 'name') // 利用populate查询from，因为from指向user，所以查的就是user,然后获取其中的name属性
            // 上面就能成功返回name属性，指定啥返回啥
            // 可以把name改成password就清楚了
            .populate('reply.from reply.to', 'name')
            .exec(function (err, comments) {
                res.render('detail', {
                    title: movie.title + ' 详情',
                    movie: movie,
                    comments: comments
                })
            })
    })
}
// views/admin
exports.new = function (req, res) {
    Classify.find({}, function (err, classifys) {
        res.render('admin', {
            title: '录入页',
            movie: {},
            classifys: classifys,
        })
    })

}
// save poster
exports.savePoster = function (req, res, next) {
    var posterData = req.files.uploadPoster
    var failPath = posterData.path
    var originalFilename = posterData.originalFilename
    if (originalFilename) {
        fs.readFile(failPath, function (err, data) { // 通过地址获取failPath的数据
            var timestamp = Date.now()
            var type = posterData.type.split('/')[1]
            var poster = timestamp + '.' + type // 定义名字
            var newPath = path.join(__dirname, '../../','static/upload/' + poster) // 创建新的存储地址
            fs.writeFile(newPath, data, function (err) {
                if (err) console.log(err)
                req.poster = '/static/upload/' + poster
                next()
            })
        })
    } else{
        next()
    }
}
// POST的新添加的movie信息
exports.save = function (req, res) {
    var id = req.body.movie._id
    var movieObj = req.body.movie
    var classifyName = req.body.movie.classifyName
    var _movie
    console.log('进入moviesave-------------------')
    if(req.poster) {
        movieObj.poster = req.poster
    }
    if(!classifyName && !movieObj.classify) {
        return res.redirect('/admin/movie/new')
    }

    if (classifyName && classifyName != '') {
        if (id) {
            Classify.findOne({name: classifyName}, function (err, classify) {
                if (!classify) {
                    new Classify({name: classifyName, movies:[id]}).save(function (err, classify) {
                        movieObj.classify = classify._id
                        Movie.findById(id, function (err, movie) {
                            Classify.findById(movie.classify, function (err, classify) {
                                console.log('----------有删除-')
                                console.log(id)
                                for (var i = 0; i < classify.movies.length; i++) {
                                    if (classify.movies[i] == id) {
                                        classify.movies.splice(i, 1)
                                        break
                                    }
                                }
                                console.log('---------删除后的classify--')
                                console.log(classify.movies)
                                console.log('--------------')
                                classify.save(function (err, classify) {
                                    _movie = _.extend(movie, movieObj)
                                    _movie.save(function (err, movie) {
                                        if (err) {
                                            console.log(err)
                                        }
                                        res.redirect('/movie/' + movie._id)
                                    })
                                })
                            })

                        })
                    })
                } else {
                    Movie.findById(id, function (err, movie) {
                        if (id === classify._id) { // 分类名一样
                            movieObj.classify = classify._id
                            _movie = _.extend(movie, movieObj)
                            _movie.save(function (err, movie) {
                                if (err) {
                                    console.log(err)
                                }
                                res.redirect('/movie/' + id)
                            })
                        } else {  // 不一样就要删除之前的
                            for (var i = 0; i < classify.movies.length; i++) {
                                if (classify.movies[i] == id) {
                                    classify.movies.splice(i, 1)
                                    break
                                }
                            }  // 保存删除后的然后在更新movie
                            classify.save(function (err, classify) {
                                _movie = _.extend(movie, movieObj)
                                _movie.save(function (err, movie) {
                                    if (err) {
                                        console.log(err)
                                    }// 给新分类添加movies后保存
                                    Classify.findById(movie.classify, function (err, classify) {
                                        classify.movies.push(movie._id)
                                        classify.save(function (err, classify) {
                                            res.redirect('/movie/' + movie._id)
                                        })
                                    })
                                })
                            })
                        }
                    })
                }
            })
        } else {
            Classify.findOne({name: classifyName}, function (err, classify) {
                if (!classify) {
                    new Classify({name: classifyName}).save(function (err, classify) {
                        movieObj.classify = classify._id
                        new Movie(movieObj).save(function (err, movie) {
                            if (err) {
                                console.log(err)
                            }
                            classify.movies.push(movie._id)
                            classify.save(function (err, classify) {
                                res.redirect('/movie/' + movie._id)
                            })
                        })
                    })
                } else {
                    movieObj.classify = classify._id
                    new Movie(movieObj).save(function (err, movie) {
                        if (err) {
                            console.log(err)
                        }
                        console.log('classify-------------')
                        console.log(classify)

                        console.log('classify-------------')
                        classify.movies.push(movie._id)
                        classify.save(function (err, classify) {
                            res.redirect('/movie/' + movie._id)
                        })
                    })
                }
            })
        }
    } else {
        if (id) {
            Movie.findById(id, function (err, movie) {
                if (movie.classify === movieObj.classify) {
                    _movie = _.extend(movie, movieObj)
                    _movie.save(function (err, movie) {
                        if (err) {
                            console.log(err)
                        }
                        res.redirect('/movie/' + movie._id)
                    })
                } else {
                    Classify.findById(movie.classify, function (err, classify) {
                        for (var i = 0; i < classify.movies.length; i++) {
                            if (classify.movies[i] == id) {
                                classify.movies.splice(i, 1)
                                break
                            }
                        }
                        classify.save(function (err, classify) {
                            Classify.findById(movieObj.classify, function (err, classify) {
                                classify.movies.push(id)
                                classify.save(function (err,classify) {
                                    _movie = _.extend(movie, movieObj)
                                    _movie.save(function (err, movie) {
                                        if (err) {
                                            console.log(err)
                                        }
                                        res.redirect('/movie/' + movie._id)
                                    })
                                })
                            })
                        })
                    })

                }
            })
        } else {
            Classify.findById(movieObj.classify, function (err, classify) {
                new Movie(movieObj).save(function (err, movie) {
                    classify.movies.push(movie._id)
                    classify.save(function (err, classify) {
                        if(err) console.log(err)
                        res.redirect('/movie/' + movie._id)
                    })
                })
            })
        }
    }
    // if (id) {
    //
    //     Movie.findById(id, function (err, movie) {
    //         if (err) {
    //             console.log(err)
    //         }
    //         if (movie.classify === movieObj.classify) {
    //
    //         }
    //         _movie = _.extend(movie, movieObj)
    //         _movie.save(function (err, movie) {
    //             if (err) {
    //                 console.log(err)
    //             }
    //
    //             res.redirect('/movie/' + movie._id)
    //         })
    //     })
    // } else {
    //     _movie = new Movie(movieObj)
    //
    //     var classifyId = movieObj.classify
    //     var classifyName = movieObj.classifyName
    //
    //     _movie.save(function (err, movie) {
    //         if (err) {
    //             console.log(err)
    //         }
    //         if (classifyId) {
    //             Classify.findById(classifyId, function (err, classify) {
    //                 classify.movies.push(movie._id)
    //
    //                 classify.save(function (err, classify) {
    //                     res.redirect('/movie/' + movie._id)
    //                 })
    //             })
    //         }
    //         else if (classifyName) {
    //             var classify = new Classify({
    //                 name: classifyName,
    //                 movies: [movie._id]
    //             })
    //
    //             classify.save(function (err, classify) {
    //                 movie.classify = classify._id
    //                 movie.save(function (err, movie) {
    //                     res.redirect('/movie/' + movie._id)
    //                 })
    //             })
    //         }
    //     })
    // }
}

//admin update movie
exports.update = function (req, res) {
    var id = req.params.id
    if (id) {
        Movie.findById(id, function (req, movie) {
            Classify.find({}, function (err, classifys) {
                res.render('admin', {
                    title: 'website 后台更新页',
                    movie: movie,
                    classifys: classifys
                })
            })
        })
    } else {
        console.log("你的电影并没有成功录入进去");
    }
}
// delete movie
exports.del = function (req, res) {
    var id = req.query.id
    console.log(id)
    if (id) {
        Movie.remove({_id: id}, function (err, movie) {
            if (err) {
                console.log(err)
            } else {
                res.json({success: 1})
            }
        })
    }
}