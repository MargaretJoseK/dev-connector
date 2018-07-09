const mongoose = require("mongoose");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs"); //hashing passwords
const jwt = require("jsonwebtoken"); //for creating tokens
const passport = require("passport");

const User = require("../../models/User.js"); //load User model

const Profile = require("../../models/Profile.js"); //load Profile model

const express = require("express");

var router = express.Router();

//routes to pages api/profile/test, public access
router.get("/test", (req, res) => res.json({ msg: "profile" }));

//routes to GET api/profile/ and get cureent user profile , private access
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile = "USer not found with this profile";
          return res.status(404).json(errors);
        }
        res.json(profile); // if user profile found.
      })
      .catch(err => {
        res.status(404).json(err);
      });
  }
);

//routes POST api/profile/ and create/edit  user profile , private access
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const profileField = {};
    profileField.user = req.user.id;

    if (req.body.handle) profileField.handle = req.body.handle;
    if (req.body.company) profileField.handle = req.body.company;
    if (req.body.website) profileField.handle = req.body.website;
    if (req.body.location) profileField.handle = req.body.location;
    if (req.body.status) profileField.handle = req.body.status;
    if (req.body.status) profileField.githubusername = req.body.githubusername;

    if (req.body.status) profileField.bio = req.body.bio;

    //skills array.
    if (typeof req.body.skills !== "undefined") {
      profileField.skills = req.body.skills.split(",");
    }
    //Social.
    profileField.social = {};
    if (req.body.youtube) profileField.social.youtube = req.body.youtube;
    if (req.body.twitter) profileField.social.twitter = req.body.twitter;
    if (req.body.facebook) profileField.social.facebook = req.body.facebook;
    if (req.body.instagram) profileField.social.instagram = req.body.instagram;
    if (req.body.linkedin) profileField.social.linkedin = req.body.linkedin;

    //updating user profile.
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileField },
            { new: true }
          ).then(profile => res.json(profile));
        } //create new profile
        else {
          const errors = {};
          Profile.findOne({ handle: profileField.handle }).then(profile => {
            if (!profile) {
              errors.handle = "Handle already exists";
              return res.status(404).json(errors);
            }
            new Profile(profileField).save().then(profile => res.json(profile)); // save profile.
          });
        }
      })
      .catch();
  }
);

module.exports = router;
