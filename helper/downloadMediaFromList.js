const downloadSingleVideo = require("./downloadSingleVideo");

// ##### download many video concurrent
const downloadMediaFromList = async (list, concurrencyLimit) => {
    // Download videos with a concurrency limit
    const downloadWithConcurrencyLimit = async () => {
        const downloadPromises = [];
        let currentConcurrency = 0;

        for (const item of list) {
            if (currentConcurrency >= concurrencyLimit) {
                await Promise.race(downloadPromises);
            }

            currentConcurrency++;
            const downloadPromise = downloadSingleVideo(item).finally(() => {
                currentConcurrency--;
            });
            downloadPromises.push(downloadPromise);
        }

        return await Promise.all(downloadPromises)
            .then(() => {
                return {
                    statusCode: 200,
                    message: "Download successfull",
                };
            })
            .catch((error) => {
                return {
                    statusCode: 400,
                    message: "Download failure",
                    error,
                };
            });
        // vì các video khi lấy về đảm bảo là luôn thành công từ lúc getVideoNoVM (goodData)
    }; // nên việc sử dụng promise.all là hoàn toàn hợp lý

    // Start downloading with concurrency limit
    await downloadWithConcurrencyLimit();
};

module.exports = downloadMediaFromList;
