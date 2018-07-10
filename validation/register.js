//validation of register.

const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (!validator.isLength(data.name, { min: 2, max: 40 })) {
    errors.name = "Name must be between 2 nd 40 characters.";
  }
  if (validator.isEmpty(data.name)) {
    errors.name = "Name is required.";
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "Email is required.";
  }
  if (validator.isEmail(data.email)) {
    errors.email = "Email is invalid.";
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "Password is required.";
  }
  if (validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm Password is required.";
  }
  if (!validator.equals(data.password, data.password2)) {
    errors.password2 = " Password must match.";
  }

  if (!validator.isLength(data.password, { min: 6, max: 20 })) {
    errors.password = "Password must be minimum of 6 characters.";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
