const { Headers } = require("node-fetch");

const getIdVideo = require("./getIdVideo.helper");

//adding useragent to avoid ip bans
const headers = new Headers();
headers.append(
    "User-Agent",
    "TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet"
);
const headersWm = new Headers();
headersWm.append(
    "User-Agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
);

const getVideoNoWM = async (url) => {
    try {
        const idVideo = await getIdVideo(url);
        const API_URL = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;

        const request = await fetch(API_URL, {
            method: "GET",
            headers: headers,
        });

        const body = await request.text();

        try {
            var res = JSON.parse(body);
        } catch (err) {
            console.error("Error:", err);
            console.error("Response body:", body);
        }
        // console.log(res.aweme_list[0]); lấy ra thông tin của toàn bộ video

        const specialCharacters = /[\\/:*?"<>|\.]/g; // có ký tự '|' ở tên file sẽ bị lỗi
        const desc = res.aweme_list[0].desc.replace(specialCharacters, "");

        const urlMedia = res.aweme_list[0].video.play_addr.url_list[0];
        const data = {
            url: urlMedia,
            id: idVideo,
            desc: desc.length >= 193 ? desc.slice(0, 193) : desc,
        };
        return data;
    } catch (error) {
        console.log(error);
    }
};

module.exports = getVideoNoWM;
