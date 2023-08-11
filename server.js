const fetch = require("node-fetch"); //?

const getDataVideo = async (url) => {
    const data = await fetch(url);

    return data;
};

module.exports = { getDataVideo };
