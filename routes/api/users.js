const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs"); //hashing passwords
const jwt = require("jsonwebtoken"); //for creating tokens
const passport = require("passport");

const User = require("../../models/User.js"); //load User model
const keys = require("../../config/keys.js");

const router = express.Router();

//routes to page api/users/test and test users route
router.get("/test", (req, res) => res.json({ msg: "hello user" }));

//routes to page api/users/register and  registers user

router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "email exist" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //rating
        d: "mm" //default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err;
          }
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//routes to page api/users/login and  logins user and return token

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email })
    .then(user => {
      //to check user
      if (!user) {
        return res.status(404).json({ email: "email not found" });
      }
      //to check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          //res.json({ msg: "success" });
          //jwt.sign(payload, secretOrPrivateKey, [options, callback])

          const payload = { id: user.id, name: user.name, avatar: user.avatar }; //create JWT payload

          //create Token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: "bearer " + token
              });
            }
          );
        } else {
          return res.status(404).json({ email: "password incorrect" });
        }
      });
    })
    .catch(e => {
      console.log(e);
    });
});

//routes to page api/users/current and return current users.access-private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
