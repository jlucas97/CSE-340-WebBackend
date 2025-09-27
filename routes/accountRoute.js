// Needed Resources 
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Route to build the login view
router.get("/login", 
  utilities.handleErrors(accountController.buildLogin)
)
// Route to build registration view
router.get("/register",
  utilities.handleErrors(accountController.buildRegister)
)

// Process Login
router.post(
  "/login",
  utilities.handleErrors(accountController.loginAccount)
)

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

module.exports = router
