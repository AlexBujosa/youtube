const mongoose = require("mongoose");
require("dotenv").config(); 

const videoSchema = new mongoose.Schema({
    email : {
        type: String,
        required : true
    },
    name : {
        type : String, 
        required : true
    },
    photo : {
        type: String,
        required : true,
        unique : true
    },
    videofile : {
        type: String,
        required : true,
        unique : true
    },
    title : {
        type: String,
        required : true
    },
    description : {
        type: String,
        required : true
    },
    userImg :{
        type:String,
        required : true,
    },
    userId :{
        type:String,
        required : true,
    }
},
{timestamps : true});
const channelSchema = new mongoose.Schema({
    email : {
        type: String,
        required : true,
        unique : true,
    },
    name : {
        type : String, 
        required : true
    },
    userImg :{
        type:String,
        required : true,
    }
})
const commentSchema = new mongoose.Schema({
    userId : {
        type : String, 
        required : true
    },
    comment : {
        type : String,
        required : true
    },
    videoId : {
        type : String,
        required : true
    },
    name : {
        type : String, 
        required : true
    },
    userImg :{
        type:String,
        required : true,
    }
}, {timestamps : true});

const viewsSchema = new mongoose.Schema({
    userId : {
        type : String,
        required : true,
    },
    videoId : {
        type : String,
        required : true,
    }
}, {timestamps : true});
const suscriberSchema = new mongoose.Schema({
    userId : {
        type : String,
        required : true,
    },
    secUserId : {
        type : String,
        required : true,
    }
}, {timestamps : true})
viewsSchema.index({userId : 1, videoId : 1}, {unique : true});
suscriberSchema.index({userId : 1, videoId : 1}, {unique : true});
const comment = mongoose.model('comments', commentSchema);
const video = mongoose.model('videos', videoSchema);
const channel = mongoose.model('channels', channelSchema);
const view = mongoose.model('views', viewsSchema);
const suscriber = mongoose.model('suscribers', suscriberSchema);
mongoose.connect(
    process.env.MONGODB_URL, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(()=>console.log('DB Connection sucessfull!'));

async function getAllVideo(){
    const filter = {}
    var allVideos = await video.find(filter).select('title name description videofile photo userImg createdAt userId').exec();
    return allVideos;
}
async function getAllComment(videoId){
    const filter = {
        videoId : videoId
    }
    var allComment = await comment.find(filter).select('userId comment videoId name userImg createdAt').exec();
    return allComment;
}
async function getAuth( email){
    const filter = {
        email : email,
    }
    var getAuth = await channel.findOne(filter).select('_id').exec();
    return getAuth;
}
async function getViews(videoId){
    const filter = {
        videoId : videoId
    }
    var views = await view.find(filter).select('_id').exec()
    return views;
}
async function getAllViews(){
    const filter ={
    }
    var views = await view.find(filter).select('videoId').exec()
    return views;
}
async function getChannelSuscriber(userId){
    const filter = {
        userId : userId
    }
    var allChannelSuscribed = await suscriber.find(filter).select('secUserId').exec();
    console.log(allChannelSuscribed);
    return allChannelSuscribed;
}
async function getVideoSuscriber(secUserId){
    const filter = {
        secUserId : secUserId
    }
    var getVideoSuscriber = await suscriber.find(filter).select('').exec();
    return getVideoSuscriber.length;
}
async function unSuscribe(userId, secUserId){
    const filter ={
        userId : userId, 
        secUserId : secUserId
    }
    return suscriber.deleteOne(filter).exec().then((res)=>{
        if(res.deletedCount === 1) return "se ha eliminado";
    });
}
module.exports = {
    video : video,
    channel : channel,
    comment : comment,
    view : view, 
    suscriber : suscriber,
    GetAllVideo : getAllVideo,
    GetAllComment : getAllComment,
    GetChannelSuscribed : getChannelSuscriber,
    GetAuth : getAuth,
    GetViews : getViews,
    GetAllViews : getAllViews,
    GetVideoSuscriber : getVideoSuscriber,
    UnSuscribe : unSuscribe
}