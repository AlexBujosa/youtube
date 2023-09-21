const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
  cloud_name: "dtaoqg3oy",
  api_key: "329254499667294",
  api_secret: "qz0Ado1yzXu-_XTxREppJ3eW7aU",
  secure: true,
});

module.exports = {
  cloudinary: cloudinary,
};
