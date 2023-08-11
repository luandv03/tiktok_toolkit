const v1Routes = require("./routes/v1/v1.route");
const express = require("express");

const path = require("path");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});

app.use("/", v1Routes);

app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
});
