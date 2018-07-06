const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser"); //for parsing the http body
const passport = require("passport");

var users = require("./routes/api/users.js");
var profile = require("./routes/api/profile.js");
var posts = require("./routes/api/posts.js");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//const db = require("./config/keys.js").mongoURI;

//connectivity to mongodb
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/margaret_db");

// mongoose
//   .connect(db)
//   .then(() => console.log("MongoDB connected"))
//   .catch(e => {
//     console.log(e);
//   });

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello");
});

//passport middleware

app.use(passport.initialize());
require("./config/passport.js")(passport);

//get routes

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});
