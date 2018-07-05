const express = require("express");

var router = express.Router();

//routes to page api/users/test and test users route
router.get("/test", (req, res) => res.json({ msg: "hello user" }));

module.exports = router;
