const getVideoNoWM = require("../../helper/getVideoNoWM.helper");
const downloadSingleVideo = require("../../helper/downloadSingleVideo.helper");
const getAllUrlVideoByUsername = require("../../helper/getAllUrlVideoByUsername.js");
const downloadMediaFromList = require("../../helper/downloadMediaFromList.js");

class TiktokService {
    async getDataVideoByUrl(url) {
        return getVideoNoWM(url);
    }

    async downloadVideoByUrl(data) {
        return downloadSingleVideo(data);
    }

    async getListDataVideoByUserName(username) {
        const listUrlVideo = await getAllUrlVideoByUsername(username);

        const listVideo = [];

        for (let i = 0; i < listUrlVideo.length; i++) {
            console.log(
                `[*] Fetching video ${i + 1} of ${listUrlVideo.length}`
            );
            console.log(`[*] URL: ${listVideo[i]}`);
            listVideo.push(getVideoNoWM(listVideo[i]));
        }

        return listVideo;
    }

    async downloadVideoFromList(dataList) {
        const limitVideoConcurrentlyDownloaded = 10;

        return await downloadMediaFromList(
            dataList,
            limitVideoConcurrentlyDownloaded
        );
    }
}

const tiktokService = new TiktokService();
module.exports = tiktokService;
