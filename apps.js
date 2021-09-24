var express= require('express')
var apps = express();
var path = require("path");
const multer  = require('multer')
apps.use(express.static("uploads"));
const { MongoClient } = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
var url = "mongodb://localhost:27017";

var cors=require('cors')
apps.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname+'/uploads')
    },
    filename: function (req, file, cb) {
        console.log("file in filename function::",file)
        var fileext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix+fileext)
    }
})

const upload = multer({storage : storage})

apps.use(express.urlencoded({ extended: true }))
apps.use(express.json());

apps.set('view engine', 'pug');
apps.set('views','./views');


apps.get("/regstd",function(req,res){
    res.sendFile(__dirname+"/stdform.html")
})

apps.get("/studentlist",function(req,res){
    MongoClient.connect(url,function(err,conn){
     var db = conn.db("delta");
     db.collection('students').find()
     .toArray(function(err,data){
         res.render("stdlist",{
             allstd:data
         })
        })
     })
   })
   apps.get("/std/:id",function(req,res){
    MongoClient.connect(url,function(err,conn){
     var db = conn.db("delta");
     db.collection('students').find({_id:ObjectId(req.params.id)})
     .toArray(function(err,data){
         res.render("profiledetails",{
             details:data
         })
         })
        })
     })

apps.get("/studentdelete/:id",function(req,res){
    MongoClient.connect(url,function(err,conn){
     var db = conn.db("delta");
     db.collection('students').deleteOne({_id:ObjectId(req.params.id)})
        res.redirect("/studentlist")
        })
     })


apps.get("/studentupdate/:id",function(req,res){
     res.render("weightform",{
         studentid:req.params.id
     })
    })


apps.post("/weightupdate",function(req,res){
    MongoClient.connect(url,function(err,conn){
    var db = conn.db("delta");
    db.collection('students').updateOne(
        {_id:ObjectId(req.body.id)},
        {
            $push:{
                weightEntry:{
                    date:req.body.date,
                    weight:req.body.weight
                },
                waist:{
                    date:req.body.date,
                    waist:req.body.waist
                }
            }
        },function(err,data){
            console.log(data)
            res.redirect("/studentlist")
        }
    )
    })
})

apps.get("/addprofile/:id",function(req,res){
    res.render("profileupdate",{
        picid:req.params.id
    })
})
 
apps.post("/updateprofile",upload.single("profilepic"),function(req,res){
    MongoClient.connect(url,function(err,con){
        var db =con.db("delta");
        db.collection("students").updateOne(
            {_id:ObjectId(req.body.id)},
            {
                $set:{
                    profilePic:req.file.filename
                    }
            },
        function(err,data){
            res.redirect('/studentlist')
        }
    )
        
    })
})

 apps.post("/addstd",upload.single("profilepic"),function(req,res){
    console.clear();
    console.log("req.file",req.file);    
    req.body.profilePic = req.file.filename;
    console.log("req.body",req.body); 
    MongoClient.connect(url,function(err,conn){
     var db = conn.db("delta");
     db.collection('students').insertOne(req.body,function(err,data){
        res.send(data);
     })
   })
})
 apps.get("/",function(req,res){
     res.send("i am working")
 })

 apps.post('/addcourse',(req,res) => {
    MongoClient.connect(url,function(err,conn){
        var db = conn.db("delta");
        db.collection('courses').insertOne(req.body,(err,data) =>{
            if(err){
                console.log(err);
            }
            else{
                res.send(data);
            }
        })

})
})
 apps.listen(9090,function(){
     console.log("listening in 9090")
 })