const mongoose = require("mongoose");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs"); //hashing passwords
const jwt = require("jsonwebtoken"); //for creating tokens
const passport = require("passport");

const User = require("../../models/User.js"); //load User model

const Profile = require("../../models/Profile.js"); //load Profile model

//load input validation
const validateProfileInput = require("../../validation/profile_validation");
const validateExperienceInput = require("../../validation/experience_validation");
const validateEducationInput = require("../../validation/education_validation");

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
      .populate("user", ["name", "avatar"])
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
//routes GET api/profile/al and  get all user profiles, public access

router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There are not any profiles";
        return res.status(404).json({ profile: "There are no profiles" });
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

//routes GET api/profile/handle/:handle and  get user profile by handle, public access
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "User not found with this profile";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

//routes GET api/profile/users/:users_id and  get user profile by user_id, public access
router.get("/users/:users_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "User not found with this profile";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

//routes POST api/profile/ and create/edit  user profile , private access
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //get user profile fields.
    const profileField = {};
    profileField.user = req.user.id;

    if (req.body.handle) profileField.handle = req.body.handle;
    if (req.body.company) profileField.company = req.body.company;
    if (req.body.website) profileField.website = req.body.website;
    if (req.body.location) profileField.location = req.body.location;
    if (req.body.status) profileField.status = req.body.status;
    if (req.body.githubusername)
      profileField.githubusername = req.body.githubusername;

    if (req.body.bio) profileField.bio = req.body.bio;

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
          Profile.findOne({ handle: profileField.handle }).then(profile => {
            if (profile) {
              errors.handle = "Handle already exists";
              return res.status(404).json(errors);
            }
            new Profile(profileField).save().then(profile => res.json(profile)); // save profile.
          });
        }
      })
      .catch(e => console.log(e));
  }
);

//routes POST api/profile/experiene and  add exp in profile, private access
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      profile.experience.unshift(newExp);
      profile.save().then(profile => res.json(profile));
    });
  }
);
//routes POST api/profile/education and  add education in profile, private access
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      profile.education.unshift(newEdu);
      profile.save().then(profile => res.json(profile));
    });
  }
);

//routes DELETE api/profile/experience/exp_id and  delete exp in profile, private access
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        // Splice out of array
        profile.experience.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//routes DELETE api/profile/education/:edu_id and  delete edu in profile, private access
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        // Splice out of array
        profile.education.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//routes DELETE api/profile and  delete user and profile, private access

router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);


module.exports = router;
