const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");

// Use stealth
puppeteer.use(pluginStealth());

const getAllUrlVideoByUsername = async (username) => {
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
        console.log("Have error: ", error);
        return [];
    } finally {
        await browser.close();
    }
};

module.export = getAllUrlVideoByUsername;
