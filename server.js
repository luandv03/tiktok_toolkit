const fetch = require("node-fetch"); //?

const getDataVideo = async (url) => {
    // const url =
    //     "https://v16m-default.akamaized.net/5355ed20df96965b7a90304833dcc1eb/64d65418/video/tos/alisg/tos-alisg-pve-0037c001/oA0k1gngQBBDK2EfbEAgIaoeqTqApO2Tiq7RUa/?a=0&ch=0&cr=0&dr=0&lr=all&cd=0%7C0%7C0%7C0&cv=1&br=4696&bt=2348&cs=0&ds=6&ft=e-t4p2BHjkn9woZLDkLnzJLO5P7CQz0iX5~1EflMyeF&mime_type=video_mp4&qs=0&rc=OjkzNTs3ZmVnN2c5ZzVkM0BpanVveDU6ZmptbTMzODczNEAuNDEtYjZeX18xYy5eMi9eYSMwLWZicjQwNl5gLS1kMTFzcw%3D%3D&l=20230811093012CF9BC849BDC9D51A8675&btag=e00088000";

    const data = await fetch(url);

    return data;
};

module.exports = { getDataVideo };
