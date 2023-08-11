const fetch = require("node-fetch");

const getDataVideo = (url) => {
    return fetch(url);
};

module.exports = { getDataVideo };
