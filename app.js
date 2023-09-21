const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const mimeTypes = require("mime-types");
const path = require("path");
//const bufferToDataUrl = require("buffer-to-data-url");

const {
  video,
  GetAllVideo,
  comment,
  channel,
  GetAuth,
  GetAllComment,
  GetViews,
  GetAllViews,
  view,
  suscriber,
  GetChannelSuscribed,
  GetVideoSuscriber,
  UnSuscribe,
  like,
  CheckUserLike,
  GetVideoLikes,
  GetMyLikes,
} = require("./database/db");
/*
const cloudinary = require("cloudinary").v2;

const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configuration
cloudinary.config({
  cloud_name: "dtaoqg3oy",
  api_key: "329254499667294",
  api_secret: "qz0Ado1yzXu-_XTxREppJ3eW7aU",
  secure: true,
});*/
const typeVideo = ["video/mp4", "video/avi", "video/flv", "video/mov"];
const typeImage = ["image/jpeg", "image/png", "image/jpg"];
const fs = require("fs");
const { promisify } = require("util");

const unlink = promisify(fs.unlink);
//const storageMemory = multer.memoryStorage();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (typeVideo.includes(file.mimetype)) {
      cb("", "assets/uploads/");
    } else if (typeImage.includes(file.mimetype)) {
      cb("", "assets/images/");
    }
  },
  filename: function (req, file, cb) {
    if (
      !typeVideo.includes(file.mimetype) &&
      !typeImage.includes(file.mimetype)
    ) {
      cb(new Error("Only Videos are permitted"));
    } else {
      cb("", crypto.randomUUID() + "." + mimeTypes.extension(file.mimetype));
    }
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (typeVideo.includes(file.mimetype)) {
      cb(null, true);
      return;
    } else if (typeImage.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("File type is not supported"));
  },
});
//parsing the incoming data

app.use(express.static("assets"));
app.use("/images", express.static("images"));
app.use("/uploads", express.static("uploads"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

/*
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized : true,
    cookie : {secure : true, maxAge : minutes5}
}));*/

app.get("/", async (req, res) => {
  const videoArr = [];
  await GetAllVideo().then((videos) => {
    videos.forEach((video) => {
      videoArr.push(video);
    });
  });
  res.status(200).json({ sucess: true, videos: videoArr });
});

app.post(
  "/upload/file",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "miniature", maxCount: 1 },
  ]),
  async (req, res) => {
    const { file, miniature } = req.files;
    const { email, name, title, description, photo, userId } = req.body;
    //console.log(file[0].filename,miniature[0].filename,email, title, description);
    const newVideo = new video({
      email: email,
      name: name,
      photo: miniature[0].filename,
      videofile: file[0].filename,
      title: title,
      description: description,
      userImg: photo,
      userId: userId,
    });
    newVideo
      .save()
      .then(() => {
        res.status(200).json({ sucess: true, msg: "Charging completed" });
      })
      .catch((error) => {
        unlink(file[0].path);
        unlink(miniature[0].path);
        res.status(200).json({ sucess: false, msg: "Something Failed" });
      });
  }
);

app.post("/auth/channel", (req, res) => {
  const { email, name, photo } = req.body;
  const newChannel = new channel({
    email: email,
    name: name,
    userImg: photo,
  });
  newChannel
    .save()
    .then(() => {
      res.status(200).json({ sucess: true, msg: "User Finally Register" });
    })
    .catch(() => {
      res.status(200).json({ sucess: false, msg: "User Already Register" });
    });
});

app.post("/getAuth", async (req, res) => {
  const { email } = req.body;
  await GetAuth(email)
    .then((Auth) => {
      res.status(200).json({ sucess: true, auth: Auth });
    })
    .catch(() => {
      res.status(200).json({ sucess: true, auth: "error" });
    });
});

app.post("/comment", (req, res) => {
  const { userId, userComment, videoId, name, userImg } = req.body;
  console.log(req.body);
  const newComment = new comment({
    userId: userId,
    comment: userComment,
    videoId: videoId,
    name: name,
    userImg: userImg,
  });
  newComment
    .save()
    .then(() => {
      res.status(200).json({ sucess: true, msg: "Comment finally uploaded" });
    })
    .catch(() => {
      res.status(200).json({ sucess: false, msg: "Something wrong occurred" });
    });
});

app.post("/getComments", (req, res) => {
  const { videoId } = req.body;
  GetAllComment(videoId)
    .then((comments) => {
      res.status(200).json({ sucess: true, comments: comments });
    })
    .catch(() => {
      res.status(200).json({ sucess: false, comments: null });
    });
});

app.get("/allviews", (req, res) => {
  GetAllViews()
    .then((views) => {
      res.status(200).json({ sucess: true, views: views });
    })
    .catch(() => {
      res.status(200).json({ sucess: false, views: [] });
    });
});

app.post("/views", (req, res) => {
  const { videoId } = req.body;
  GetViews(videoId)
    .then((views) => {
      res.status(200).json({ sucess: true, views: views });
    })
    .catch(() => {
      res.status(200).json({ sucess: false, views: 0 });
    });
});

app.post("/register/views", (req, res) => {
  const { userId, videoId } = req.body;
  const newView = new view({
    userId: userId,
    videoId: videoId,
  });
  newView
    .save()
    .then(() => {
      res.status(200).json({ sucess: true, msg: "Views registered" });
    })
    .catch(() => {
      res.status(200).json({ success: false, msg: "View already registered" });
    });
});

app.post("/suscribe", (req, res) => {
  const { userId, secUserId } = req.body;
  const newSuscriber = new suscriber({
    userId: userId,
    secUserId: secUserId,
  });
  newSuscriber
    .save()
    .then(() => {
      res.status(200).json({ sucess: true, msg: "Subscribed user" });
    })
    .catch(() => {
      res
        .status(200)
        .json({ sucess: false, msg: "Previously registered user" });
    });
});

app.post("/unsuscribe", (req, res) => {
  const { userId, secUserId } = req.body;
  UnSuscribe(userId, secUserId)
    .then((resp) => {
      console.log(resp);
      if (resp === "se ha eliminado") {
        res.status(200).json({ sucess: true, msg: "Unsubscribed user" });
      } else {
        res
          .status(200)
          .json({ sucess: true, msg: "Somenthing Ocurred trying to deleted" });
      }
    })
    .catch(() => {
      res.status(200).json({ sucess: false, msg: "Error ocurred" });
    });
});

app.post("/getAllSuscribeChannel", (req, res) => {
  const { userId } = req.body;
  GetChannelSuscribed(userId)
    .then((channels) => {
      var allChannels = [];
      channels.forEach((channel) => {
        allChannels.push(channel.secUserId);
      });
      res.status(200).json({ sucess: true, channelsSuscribed: allChannels });
    })
    .catch(() => {
      res.status(200).json({ sucess: true, channelsSuscribed: null });
    });
});

app.post("/getVideoSuscriber", (req, res) => {
  const { secUserId } = req.body;
  GetVideoSuscriber(secUserId)
    .then((count) => {
      res.status(200).json({ sucess: true, countSuscriber: count });
    })
    .catch(() => {
      res.status(200).json({ sucess: false, countSuscriber: 0 });
    });
});

app.post("/getVideoLikes", (req, res) => {
  const { videoId } = req.body;
  GetVideoLikes(videoId).then((countLikes) => {
    var counterLikes = countLikes.filter(
      (likes) => likes.typeLike === true
    ).length;
    var counterDislikes = countLikes.filter(
      (dislikes) => dislikes.typeLike === false
    ).length;
    res.status(200).json({
      sucess: true,
      counterLikes: counterLikes,
      counterDislikes: counterDislikes,
    });
  });
});

app.post("/getMyVideoLike", (req, res) => {
  const { videoId, userId } = req.body;
  GetMyLikes(userId, videoId).then((typeLike) => {
    var statusLike;
    if (typeLike.length !== 0) {
      statusLike = typeLike[0].typeLike;
    } else {
      statusLike = null;
    }

    res.status(200).json({ sucess: true, status: statusLike });
  });
});

app.post("/like", async (req, res) => {
  const { userId, videoId, typeLike } = req.body;
  var resp = await CheckUserLike(userId, videoId);
  const filter = {
    userId: userId,
    videoId: videoId,
    typeLike: typeLike,
  };
  const filterUpdate = {
    userId: userId,
    videoId: videoId,
  };
  const update = {
    $set: {
      typeLike: typeLike,
    },
  };
  const newLike = new like(filter);
  if (resp.length === 0) {
    newLike
      .save()
      .then(() => {
        res.status(200).json({ sucess: true, msg: "sucessfull" });
      })
      .catch(() => {
        res.status(200).json({ sucess: false, msg: "oh oh Error Ocurred" });
      });
  } else if (resp[0].typeLike === typeLike) {
    like
      .deleteOne({ userId: userId, videoId: videoId })
      .exec()
      .then(() => {
        res.status(200).json({ sucess: true, msg: "sucessfull deleted" });
      })
      .catch(() => {
        res.status(200).json({
          sucess: false,
          msg: "oh oh Error Ocurred. Trying to deleted",
        });
      });
  } else {
    console.log(filter);
    like
      .updateOne(filterUpdate, update)
      .exec()
      .then(() => {
        res.status(200).json({ sucess: true, msg: "sucessfull updated" });
      })
      .catch(() => {
        res.status(200).json({
          sucess: false,
          msg: "oh oh Error Ocurred. Trying to updated",
        });
      });
  }
});

app.listen(4000, (req, res) => {
  console.log("Server Up!");
});
