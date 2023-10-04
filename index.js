const express = require("express");
const app = express();
const cors = require("cors");
const blogs = require("./routes/blogs");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", blogs);

app.listen(3000, () => {
    console.log("Server up and running");
})