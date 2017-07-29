// 负责评论信息相关的交互
var Comment = require('../models/comment')

// POST的新添加的comment信息
exports.save = function (req, res) {
    var _comment = req.body.comment
    // var movieId = _comment.movie
    console.log('--------comment------------')
    console.log(_comment)
    console.log('--------------------')
    if (_comment.cid) {
        Comment.findById(_comment.cid, function (err, comment) {
            var reply = {
                from: _comment.from,
                to: _comment.tid,
                content: _comment.content,
            }
            comment.reply.push(reply)
            comment.save(function (err, comment) {
                if (err) {
                    console.log(err)
                }
                res.json({success:1})
            })
        })
    } else {
        var comment = new Comment(_comment)
        comment.save(function (err, comment) {
            if (err) {
                console.log(err)
            }
            console.log('---------评论-')
            res.json({success:1})
            // res.redirect('/movie/' + movieId)
        })
    }
}