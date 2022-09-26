const express = require('express');
const app = express();
const cors = require('cors')
const multer = require('multer')
const crypto = require('crypto');
const bodyParser= require('body-parser')
const mimeTypes = require('mime-types');
const {video, GetAllVideo} = require('./database/db');
const typeVideo = ["video/mp4", "video/avi", "video/flv", "video/mov", "video/mov"];
const typeImage = ["image/jpeg", "image/png", "image/jpg"];
const fs = require('fs')
const {promisify} = require('util')

const unlink = promisify(fs.unlink)
const storage = multer.diskStorage({
    destination:function(req, file, cb){
        if(typeVideo.includes(file.mimetype)){
            cb("", 'assets/uploads/')
        }
        else if(typeImage.includes(file.mimetype)){
            cb("", 'assets/images/')
        }
    },
    filename: function(req, file, cb){
        if(!typeVideo.includes(file.mimetype) && !typeImage.includes(file.mimetype)){
            cb(new Error("Only Videos are permitted"));
        }else{
            cb("", crypto.randomUUID()+"."+ mimeTypes.extension(file.mimetype))
        }
        
    }
}
)
const upload = multer({
    storage:storage,
})
//parsing the incoming data
app.use(bodyParser.urlencoded({extended : true}));
app.use(cors());
app.use(express.json());

/*
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized : true,
    cookie : {secure : true, maxAge : minutes5}
}));*/
app.get('/',async(req, res)=>{
    const videoArr = []
    await GetAllVideo().then(videos =>{
        videos.forEach(video => {
            videoArr.push(video);
        });
    });
    
    res.status(200).json({sucess:true, videos : videoArr})
})
app.post('/upload/file',upload.fields([{name:'file', maxCount : 1}, {name:'miniature', maxCount : 1}]), (req, res)=>{
    const {file, miniature} = req.files;
    const {email,name, title, description, photo} = req.body;
    //console.log(file[0].filename,miniature[0].filename,email, title, description);
    const newVideo = new video({
        email : email, 
        name : name,
        photo : miniature[0].filename, 
        videofile : file[0].filename,
        title : title,
        description : description,
        userImg : photo,
    });
    newVideo.save().then(()=>{
        res.status(200).json({sucess:true, msg:"Charging completed"})
    }).catch(error =>{
        console.log('Files Remove Error Ocurred :', error)
        unlink(file[0].path)
        unlink(miniature[0].path)
        res.status(200).json({sucess:false, msg:"Something Failed"})
    });
    
})
app.listen(4000, (req, res)=>{
    console.log('Server Up!')
})