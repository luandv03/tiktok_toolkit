const { Router } = require("express");

const tiktokRoues = require("./tiktok/tiktok.route");

const v1Routes = Router();

v1Routes.use("/api/v1/", tiktokRoues);

module.exports = v1Routes;
