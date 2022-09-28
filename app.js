const express = require('express');
const app = express();
const cors = require('cors')
const multer = require('multer')
const crypto = require('crypto');
const bodyParser= require('body-parser')
const mimeTypes = require('mime-types');
const {video, GetAllVideo, comment, channel,GetAuth, GetAllComment, GetViews, GetAllViews, view} = require('./database/db');
const typeVideo = ["video/mp4", "video/avi", "video/flv", "video/mov", "video/mov"];
const typeImage = ["image/jpeg", "image/png", "image/jpg"];
const fs = require('fs')
const {promisify} = require('util');

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
    console.log(videoArr);
    res.status(200).json({sucess:true, videos : videoArr})
})
app.post('/upload/file',upload.fields([{name:'file', maxCount : 1}, {name:'miniature', maxCount : 1}]), (req, res)=>{
    const {file, miniature} = req.files;
    const {email,name, title, description, photo, userId} = req.body;
    //console.log(file[0].filename,miniature[0].filename,email, title, description);
    const newVideo = new video({
        email : email, 
        name : name,
        photo : miniature[0].filename, 
        videofile : file[0].filename,
        title : title,
        description : description,
        userImg : photo,
        userId : userId,
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
app.post('/auth/channel', (req, res) =>{
    const {email,name, photo} = req.body;
    const newChannel = new channel({
        email : email,
        name : name,
        userImg : photo
    });
    newChannel.save().then(()=>{
        res.status(200).json({sucess:true, msg:"User Finally Register"})
    }).catch(()=>{
        res.status(200).json({sucess:false, msg:"User Already Register"})
    });
})
app.post('/getAuth', async(req, res)=>{
    const {email}= req.body;
    await GetAuth(email).then((Auth)=>{
        console.log(Auth);
        res.status(200).json({sucess:true, auth : Auth})
    }).catch(()=>{
        res.status(200).json({sucess:true, auth : "error"})
    })
})
app.post('/comment', (req, res)=>{
    const {userId, userComment, videoId, name, userImg} = req.body;
    console.log(req.body);
    const newComment = new comment({
        userId : userId,
        comment : userComment,
        videoId : videoId,
        name : name,
        userImg : userImg,
    });
    newComment.save().then(()=>{
        res.status(200).json({sucess:true, msg : "Comment finally uploaded"})
    }).catch(()=>{
        res.status(200).json({sucess:false, msg : "Something wrong occurred"})
    })
})
app.post('/getComments', (req, res)=>{
    const {videoId} = req.body;
    GetAllComment(videoId).then((comments)=>{
        res.status(200).json({sucess:true, comments: comments })
    }).catch(()=>{
        res.status(200).json({sucess:false, comments: null})
    });
    
})
app.get('/allviews', (req, res)=>{
    GetAllViews().then((views)=>{
        res.status(200).json({sucess:true, views:views })
    }).catch(()=>{
        res.status(200).json({sucess:false, views: []})
    })
})
app.post('/views', (req, res)=>{
    const {videoId} = req.body;
    GetViews(videoId).then((views)=>{
        res.status(200).json({sucess:true, views:views })
    }).catch(()=>{
        res.status(200).json({sucess:false, views: 0})
    })
})
app.post('/register/views', (req, res)=>{
    const {userId, videoId} = req.body;
    const newView = new view({
        userId : userId,
        videoId : videoId
    })
    newView.save().then(()=>{
        res.status(200).json({sucess:true, msg : "Views registered" })
    }).catch(()=>{
        res.status(200).json({success: false, msg : "View already registered"})
    })
})
app.listen(4000, (req, res)=>{
    console.log('Server Up!')
})