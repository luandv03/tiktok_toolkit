const fs = require("fs");
const { getDataVideo } = require("./getDataVideo.js");

const downloadSingleVideo = async (item) => {
    const folder = "downloads/";

    return new Promise((resolve, reject) => {
        const fileName = `${item.id}-${item.desc}.mp4`;
        const downloadFile = getDataVideo(item.url);
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

module.exports = { downloadSingleVideo };
