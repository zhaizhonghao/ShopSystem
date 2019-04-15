var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var session = require('express-session')
var md5 = require('md5-node')
var DB= require('./modules/db.js')
var multiparty = require('multiparty')
var objectId=require('mongodb').ObjectID;
var fs = require('fs')

var app = new express()
//配置session中间件
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge:1000*30*60 },
    rolling : true
}))
//配置ejs中间件
app.set('view engine','ejs')

//配置静态目录
app.use(express.static('public'))
//配置虚拟静态目录
app.use('/upload',express.static('upload'))

//配置body-parser中间件，解析post请求
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//自定义中间件
app.use(function (req, res,next) {
    if (req.url == '/login' || req.url == '/doLogin') {
        next()
    } else{
        if (req.session.userinfo && req.session.userinfo.username != '') {
            next()
        }else{
            res.redirect('/login')
        }
    }
})


app.get('/',function (req, res) {
    res.send('hello')
})

app.get('/login',function (req, res) {
    res.render('login')
})


app.post('/doLogin',function (req, res) {

    //获取登录窗口的用户名和密码，密码在数据库中以MD5加密的形式存储
    var username = req.body.username.toString()
    var password = md5(req.body.password)
    DB.find('user',{username:username,password:password},function (docs) {
        if (docs && docs.length > 0) {
            console.log("登录成功")
            //将用户信息存储在session中
            req.session.userinfo = docs[0]
            //将session的内容暂存在全局变量app.locals中,为了让所有的界面都能读取该值
            app.locals['userinfo'] = req.session.userinfo
            res.redirect('/product')
        }else{
            res.send("<script>alert('登录失败');location.href='/login'</script>")
        }
    })
})

app.get('/product',function (req, res) {

    DB.find('product',{},function (docs) {
        res.render('product',{products:docs})
    })

})

app.get('/productadd',function (req, res) {

    res.render('productadd')
})

app.post('/upload',function (req, res) {
    var form = new multiparty.Form();
    form.uploadDir= 'upload'//存放图片的目录 该目录必须存在
    form.parse(req, function(err, fields, files) {

        var title = fields.title;
        var price = fields.price;
        var post = fields.fee;
        var description = fields.description;
        var pic = files.pic[0].path

        DB.insert('product',{
            pic:pic,
            name:title,
            price:price,
            post:post,
            description:description
        },function (err) {
            if (err) {
                console.log(err)
            }else {
                res.redirect('/product')
            }
        })
    });
})

app.get('/productedit',function (req, res) {
    var id = new objectId(req.query.id)
    DB.find('product',{_id:id},function (data) {
        console.log(data)
        res.render('productedit',{product:data[0]})
    })
})

app.get('/productedit',function (req, res) {
    res.redirect('/product')
})

app.post('/doProductEidt',function (req, res) {
    var form = new multiparty.Form();
    form.uploadDir= 'upload'//存放图片的目录 该目录必须存在
    form.parse(req, function(err, fields, files) {

        console.log(fields)
        console.log(files)
        var title = fields.title;
        var price = fields.price;
        var post = fields.fee;
        var description = fields.description;
        var pic = files.pic[0].path
        var setData;
        if (files.pic[0].originalFilename) {
            setData={
                pic:pic,
                name:title,
                price:price,
                post:post,
                description:description
            }
        }else {
            setData={
                name:title[0],
                price:price[0],
                post:post[0],
                description:description[0]
            }
            fs.unlink(pic,function (err) {
                if (err) {
                    console.log(err)
                }
            })

        }

        DB.update('product',{_id: new objectId(fields._id[0])},setData,function (err) {
            if (err) {
                console.log(err)
            }else {
                res.redirect('/product')
            }
        })
    });
})

app.get('/productdelete',function (req, res) {
    DB.deleteOne('product',{_id:new objectId(req.query.id)},function (err) {
        if (err) {
            console.log(err)
        }
        res.redirect('/product')
    })
})

app.get('/logout',function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err)
        }else{
            client.close()
            res.redirect('/login')
        }
    })
})

app.listen(8001,'127.0.0.1')
