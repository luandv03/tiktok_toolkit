const tiktokService = require("../../services/tiktok/tiktok.service");

class TiktokController {
    async getDataVideoByUrl(req, res) {
        const url = req.body.url;

        tiktokService
            .getDataVideoByUrl(url)
            .then(async (data) => {
                return res.status(200).json({
                    statusCode: 200,
                    message: "Get data video successfull",
                    data: data,
                });
            })
            .catch((err) => {
                return res.status(400).json({
                    statusCode: 400,
                    message:
                        "Download video failre . Can't fetch data from url",
                    error: err,
                });
            });
    }

    async downloadVideoByUrl(req, res) {
        const data = req.body.videoData;

        tiktokService
            .downloadVideoByUrl(data)
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
    }

    async getGoodDataByUsername(req, res) {
        const username = req.body.username;

        const listVideo = await tiktokService.getListDataVideoByUserName(
            username
        );

        Promise.allSettled(listVideo)
            .then(async (result) => {
                const goodData = result
                    .filter((item) => item.status === "fulfilled")
                    .map((data) => data.value);

                const badData = result
                    .filter((item) => item.status === "rejected")
                    .map((data) => data.reason);

                return res.status(200).json({
                    message: "Download successfull",
                    totalGoodData: goodData.length,
                    totalBadData: badData.length,
                    goodData,
                });
            })
            .catch((err) => {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Get data video failure",
                    err,
                });
            });
    }

    async downloadVideoFromList(req, res) {
        try {
            const dataList = req.body.dataList;

            const data = await tiktokService.downloadVideoFromList(dataList);

            return res.status(data.statusCode).json(data);
        } catch (error) {
            return res.status(500).json({
                statusCode: 500,
                message: "Internal Server Error",
                error,
            });
        }
    }
}

module.exports = TiktokController;
