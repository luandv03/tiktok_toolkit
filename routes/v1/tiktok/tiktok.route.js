const { Router } = require("express");
const tiktokRoues = Router();

const TiktokController = require("../../../controllers/tiktok/tiktok.controller");
const tiktokController = new TiktokController();

// getDataVideoByUrl
tiktokRoues.get("/get/data_video_by_url", tiktokController.getDataVideoByUrl);

//download video by url
tiktokRoues.get("/download/video_by_url", tiktokController.downloadVideoByUrl);

//get list good data by username
tiktokRoues.get(
    "/get/data_list_video_by_username",
    tiktokController.getDataListVideo
);

//download list video
tiktokRoues.get("/download/list_video", tiktokController.downloadListVideo);

module.exports = tiktokRoues;
