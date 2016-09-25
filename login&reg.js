var express=require("express");//������������
var cookieparse=require("cookie-parser");//cookie
var session=require("express-session");//session
var mysql=require("mysql");//�������ݿ�
var fs=require("fs");//�����ļ���Ŀ¼��
var bodyparse=require("body-parser");//���������
var multer=require("multer");//�����ļ�������

var app=express();//����һ��Ӧ�ó���
//���ú�ʹ��body-parser�м��
app.use(bodyparse.urlencoded({extended:false}));
var pool=mysql.createPool({
    host:"127.0.0.1",
    port:3306,
    database:"fish",//���ݿ������
    user:"root",
    password:"pwd"//���ݿ������
});
//ʹ�þ�̬�м��
app.use(express.static("page"));//Ĭ�ϵ�page�ļ����²��Ҿ�̬��Դ
app.use(session({
    secret:'keyboard cat',
    resave:true,
    saveUninitialized:true,
    cookie:{secure:false,maxAge:1000*60*2}
}));
var upload=multer({dest:"./page/pic"});//�ϴ�ͼƬ��Ŀ¼�趨
//�����û���¼�ķ���
app.post("/userLogin",function(req,res){
    if(req.body.uname==""){
        res.send("1");		//�û���Ϊ��
    }else if(req.body.pwd==""){
        res.send("2");		//����Ϊ��
    }else{
        pool.getConnection(function(err,conn){
            if(err){
                res.send("3");		//���ݿ�����ʧ��
            }else{
                conn.query("select * from usersinfo where uname=? and pwd=?",[req.body.uname,req.body.pwd],function(err,result){
                    if(err){
                        res.send("4");	//���ݲ�ѯʧ��
                    }else{
                        if(result.length>0){
                            console.info(result);
                            req.session.currentLoginUser=result[0];
                            res.send("6");		//��¼�ɹ�
                        }else{
                            res.send("5");		//�û������������
                        }
                    }
                });
            }
        });
    }
});
//�����û�ע��ķ���
app.post("/userRegister",function(req,res){
    var result="0";
    if(req.body.uname==""){
        res.send("1");//˵���û���Ϊ��
    }else if(req.body.pwd==""){
        res.send("2");//˵������Ϊ��
    }else if(req.body.pwd!=req.body.pwdagain){
        res.send("3");//˵��ǰ��������������벻һ��
    }else if(req.body.email==""){
        res.send("4");//˵������Ϊ��
    }else{
        pool.getConnection(function(err,connection){
            if(err){
                res.send("5");//˵�����ݿ�����ʧ��
            }else{
                connection.query("insert into usersinfo (uname,pwd,email) values(?,?,?)",[req.body.uname,req.body.pwd,req.body.email],function(err,result){
                    if(err){
                        console.info(err);
                        res.send("6");//�������ʧ��
                    }else{
                        res.send("7");//ע��ɹ�
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
        console.info("Ӧ�ó�������������");
    }
})
