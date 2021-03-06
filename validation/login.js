//validation of register.

const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};
  // data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (validator.isEmpty(data.email)) {
    errors.email = "Email is required.";
  }
  if (validator.isEmail(data.email)) {
    errors.email = "Email is invalid.";
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "Password is required.";
  }

  if (!validator.isLength(data.password, { min: 5, max: 20 })) {
    errors.password = "Password must be minimum of 6 characters.";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
