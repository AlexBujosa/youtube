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
    }
});
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
const video = mongoose.model('videos', videoSchema);
const channel = mongoose.model('channel', channelSchema);
mongoose.connect(
    process.env.MONGODB_URL, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(()=>console.log('DB Connection sucessfull!'));

async function getAllVideo(){
    const filter = {}
    var allVideos = await video.find(filter).select('title name description videofile photo userImg').exec();
    return allVideos;
}

module.exports = {
    video : video,
    channel : channel,
    GetAllVideo : getAllVideo
}