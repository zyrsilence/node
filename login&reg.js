var express=require("express");//创建服务器的
var cookieparse=require("cookie-parser");//cookie
var session=require("express-session");//session
var mysql=require("mysql");//操作数据库
var fs=require("fs");//操作文件或目录的
var bodyparse=require("body-parser");//处理请求的
var multer=require("multer");//处理文件长传的

var app=express();//创建一个应用程序
//配置和使用body-parser中间件
app.use(bodyparse.urlencoded({extended:false}));
var pool=mysql.createPool({
    host:"127.0.0.1",
    port:3306,
    database:"fish",//数据库的名字
    user:"root",
    password:"pwd"//数据库的密码
});
//使用静态中间件
app.use(express.static("page"));//默认到page文件夹下查找静态资源
app.use(session({
    secret:'keyboard cat',
    resave:true,
    saveUninitialized:true,
    cookie:{secure:false,maxAge:1000*60*2}
}));
var upload=multer({dest:"./page/pic"});//上传图片的目录设定
//处理用户登录的方法
app.post("/userLogin",function(req,res){
    if(req.body.uname==""){
        res.send("1");		//用户名为空
    }else if(req.body.pwd==""){
        res.send("2");		//密码为空
    }else{
        pool.getConnection(function(err,conn){
            if(err){
                res.send("3");		//数据库连接失败
            }else{
                conn.query("select * from usersinfo where uname=? and pwd=?",[req.body.uname,req.body.pwd],function(err,result){
                    if(err){
                        res.send("4");	//数据查询失败
                    }else{
                        if(result.length>0){
                            console.info(result);
                            req.session.currentLoginUser=result[0];
                            res.send("6");		//登录成功
                        }else{
                            res.send("5");		//用户名或密码错误
                        }
                    }
                });
            }
        });
    }
});
//处理用户注册的方法
app.post("/userRegister",function(req,res){
    var result="0";
    if(req.body.uname==""){
        res.send("1");//说明用户名为空
    }else if(req.body.pwd==""){
        res.send("2");//说明密码为空
    }else if(req.body.pwd!=req.body.pwdagain){
        res.send("3");//说明前后两次输入的密码不一致
    }else if(req.body.email==""){
        res.send("4");//说明邮箱为空
    }else{
        pool.getConnection(function(err,connection){
            if(err){
                res.send("5");//说明数据库连接失败
            }else{
                connection.query("insert into usersinfo (uname,pwd,email) values(?,?,?)",[req.body.uname,req.body.pwd,req.body.email],function(err,result){
                    if(err){
                        console.info(err);
                        res.send("6");//数据添加失败
                    }else{
                        res.send("7");//注册成功
                    }
                });
            }
        });
    }
});
app.listen(80,function(err) {
    if(err){
        console.info(err);
    }else{
        console.info("应用程序启动。。。");
    }
})
