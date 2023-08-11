const { getDataVideo } = require("./helper/getDataVideo.js");
const { downloadSingleVideo } = require("./helper/downloadSingleVideo.js");

const express = require("express");

const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const { Headers } = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Use stealth
puppeteer.use(pluginStealth());

const app = express();

const PORT = 3000;

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

async function getAllVideosByUsername(username) {
    const scrollDelay = 3000; // Thời gian chờ sau mỗi lần cuộn (3 giây)

    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 720 });

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    const url = `https://www.tiktok.com/${username}`;

    await page.goto(url);

    await page.waitForTimeout(scrollDelay);

    try {
        let previousHeight;
        let scrollAttempts = 0;
        const maxScrollAttempts = 2; // Giới hạn số lần cuộn trang

        let videoList = [];

        while (scrollAttempts < maxScrollAttempts) {
            // Cuộn trang xuống và chờ để tải thêm video
            await page.evaluate(
                "window.scrollTo(0, document.body.scrollHeight);"
            );
            console.log("Dang doi hehehehe");
            await page.waitForTimeout(scrollDelay);

            const videoLinks = await page.$$eval(
                'div[data-e2e="user-post-item-desc"] a',
                (links) => links.map((link) => link.href)
            );

            const arr = videoLinks.filter((item) =>
                item.includes(`${username}/video`)
            );
            console.log("Vua lay duoc ", arr.length, " videos");

            videoList.push(...arr);

            // Lấy chiều cao hiện tại của trang
            const currentHeight = await page.evaluate(
                "document.body.scrollHeight"
            );

            // // Kiểm tra xem trang còn thêm video không
            if (currentHeight === previousHeight) {
                break;
            }

            previousHeight = currentHeight;
            scrollAttempts++;
        }

        const result = [...new Set(videoList)];

        console.log(
            `Tổng số video của người dùng ${username}: ${result.length}`
        );

        console.log(result);

        return result;
    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
    } finally {
        await browser.close();
    }
}

const getIdVideo = (url) => {
    const matching = url.includes("/video/");
    if (!matching) {
        console.log("[X] Error: URL not found");
        exit();
    }
    const idVideo = url.substring(url.indexOf("/video/") + 7, url.length);
    return idVideo.length > 19
        ? idVideo.substring(0, idVideo.indexOf("?"))
        : idVideo;
};

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

// ##### download many video concurrent
const downloadMediaFromList = async (list, concurrencyLimit) => {
    const folder = "downloads/";

    // Function to download a single video
    const downloadVideo = async (item) => {
        return new Promise((resolve, reject) => {
            const fileName = `${item.id}-${item.desc}.mp4`;
            const downloadFile = fetch(item.url);
            const file = fs.createWriteStream(folder + fileName);

            downloadFile
                .then((res) => {
                    res.body.pipe(file);
                    file.on("finish", () => {
                        file.close();
                        resolve();
                    });
                    file.on("error", (err) => {
                        file.close();
                        reject(err);
                    });
                })
                .catch((err) => {
                    console.log(`[x] Erro: ${err}`);
                    reject(err);
                });
        });
    };

    // Download videos with a concurrency limit
    const downloadWithConcurrencyLimit = async () => {
        const downloadPromises = [];
        let currentConcurrency = 0;

        for (const item of list) {
            if (currentConcurrency >= concurrencyLimit) {
                await Promise.race(downloadPromises);
            }

            currentConcurrency++;
            const downloadPromise = downloadVideo(item)
                .catch(() => {
                    currentConcurrency--;
                })
                .finally(() => {
                    currentConcurrency--;
                });
            downloadPromises.push(downloadPromise);
        }

        await Promise.all(downloadPromises)
            .then(() => {
                console.log("Done OK!");
            })
            .catch((err) => {
                console.log("error promise all: " + err);
            })
            .finally(() => {
                console.log("Done !!!!!");
            }); // vì các video khi lấy về đảm bảo là luôn thành công từ lúc getVideoNoVM
    }; // nên việc sử dụng promise.all là hoàn toàn hợp lý

    // Start downloading with concurrency limit
    await downloadWithConcurrencyLimit();
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/download_video_by_url", async (req, res) => {
    getVideoNoWM(
        "https://www.tiktok.com/@gdfactoryclips/video/7265771848686718216"
    )
        .then(async (data) => {
            await downloadSingleVideo(data)
                .then(() => {
                    return res.status(200).json({
                        statusCode: 200,
                        message: "Download video successfull",
                    });
                })
                .catch((err) => {
                    return res.status(400).json({
                        statusCode: 400,
                        message: "Download video failure",
                        error: err,
                    });
                });

            // can't set header after is sent to client
            // lỗi này đã xuất hiện khi tôi để finally(() => {return res.status(200).json({})})
            // lỗi ở đây là do khi tôi đã trả kết quả về cho client bên trong .then() thì lúc này
            // nó đã đánh dấu kết thúc 1 request nhưng sau đó nó lại tiếp tục được gọi
            // bên trong hàm .finally nên sẽ sinh ra lỗi này vì kết quả đã được trả về cho client
            // ở hàm .then phía trên trong lần request này
        })
        .catch((err) => {
            return res.status(400).json({
                statusCode: 400,
                message: "Download video failre . Can't fetch data from url",
                error: err,
            });
        });
});

app.get("/download_list_by_username", async (req, res) => {
    const listVideo = await getAllVideosByUsername("@revistahola.mx");

    const arr = [];

    for (let i = 0; i < listVideo.length; i++) {
        console.log(`[*] Downloading video ${i + 1} of ${listVideo.length}`);
        console.log(`[*] URL: ${listVideo[i]}`);
        arr.push(getVideoNoWM(listVideo[i]));
    }

    Promise.allSettled(arr)
        .then(async (result) => {
            const dataGood = result
                .filter((item) => item.status === "fulfilled")
                .map((data) => data.value);

            const badData = result
                .filter((item) => item.status === "rejected")
                .map((data) => data.reason);

            console.log("Total bad data: " + badData.length);

            console.log("Total good data: ", dataGood.length);

            const limitVideoConcurrentlyDownloaded = 10;

            await downloadMediaFromList(
                dataGood,
                limitVideoConcurrentlyDownloaded
            )
                .then(() => {
                    console.log("[+] Downloaded successfully");
                })
                .catch((err) => {
                    console.log("[X] Error: " + err);
                });

            return res.json({
                message: "Download successfull",
                dataGood,
            });
        })
        .catch((err) => {
            console.error(err);
        });
});

app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
});
