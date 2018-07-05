const express = require("express");

var router = express.Router();

//routes to pages
router.get("/test", (req, res) => res.json({ msg: "hello world" }));

module.exports = router;
