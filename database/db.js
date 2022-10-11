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
const likeSchema = new mongoose.Schema({
    userId : {
        type : String,
        required : true,
    },
    videoId : {
        type : String,
        required : true
    },
    typeLike : {
        type : Boolean,
        required : true,
    }
}, {timestamps : true});
likeSchema.index({userId : 1, videoId : 1},{unique : true})
viewsSchema.index({userId : 1, videoId : 1}, {unique : true});
suscriberSchema.index({userId : 1, videoId : 1}, {unique : true});
const comment = mongoose.model('comments', commentSchema);
const video = mongoose.model('videos', videoSchema);
const channel = mongoose.model('channels', channelSchema);
const view = mongoose.model('views', viewsSchema);
const suscriber = mongoose.model('suscribers', suscriberSchema);
const like = mongoose.model('like', likeSchema);
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
async function checkUserLike(userId, videoId){
    const filter = {
        userId : userId,
        videoId : videoId
    }
    var response = await like.find(filter).select('typeLike').exec();
    return response;
}
async function getVideoLikes(videoId){
    const filter = {
        videoId : videoId
    }
    var response = await like.find(filter).select('typeLike').exec();
    return response;
}
async function getMyLike(userId, videoId){
    const filter = {
        videoId : videoId,
        userId : userId
    }
    return await like.find(filter).select('typeLike').exec().then((res)=>{
        return res;
    });
}
module.exports = {
    video : video,
    channel : channel,
    comment : comment,
    view : view, 
    suscriber : suscriber,
    like : like, 
    GetAllVideo : getAllVideo,
    GetAllComment : getAllComment,
    GetChannelSuscribed : getChannelSuscriber,
    GetAuth : getAuth,
    GetViews : getViews,
    GetAllViews : getAllViews,
    GetVideoSuscriber : getVideoSuscriber,
    UnSuscribe : unSuscribe,
    CheckUserLike : checkUserLike,
    GetVideoLikes: getVideoLikes,
    GetMyLikes: getMyLike
}