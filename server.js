const mongoose = require("mongoose");
const express = require("express");

var users = require("./routes/api/users.js");
var profile = require("./routes/api/profile.js");
var posts = require("./routes/api/posts.js");

var app = express();
const db = require("./config/keys.js").mongoURI;

const port = process.env.PORT || 3000;

//connectivity to db

mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch(e => {
    console.log(e);
  });

app.get("/", (req, res) => {
  res.send("Hello");
});
//get routes

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});
