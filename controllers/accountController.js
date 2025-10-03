const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accountController = {};

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Login
 * *************************************** */
accountController.loginAccount = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  try {
    const accountData = await accountModel.getAccountByEmail(account_email)
    
    if (!accountData) {
      req.flash("notice", "Invalid email or password. Please try again.")
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        notice: req.flash("notice")[0],
        account_email
      })
    }

    // ✅ Compare hashed password with bcrypt

    const match = await bcrypt.compare(account_password, accountData.account_password)


    if (!match) {
      req.flash("error", "Invalid email or password. Please try again.")
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        error: req.flash("error")[0] || null,
        account_email
      })
    }

    delete accountData.account_password

    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600000 })
    }

    req.flash("success", `Welcome back, ${accountData.account_firstname}!`)
    return res.redirect("/account/")
  } catch (error) {
    console.error("💥 Login error:", error)
    req.flash("error", "Something went wrong during login.")
    return res.status(500).render("account/login", { title: "Login", nav })
  }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
accountController.buildAccount = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/management", {  
      title: "Account Management",
      nav
    })
  } catch (error) {
    next(error)
  }
}


/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // Use async hash since we are in an async function
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    console.error("Error hashing password:", error);
    req.flash("error", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: req.flash("error")[0] || null
    });
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult && regResult.rowCount > 0) {
      req.flash("success", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
      });
    } else {
      req.flash("error", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Register",
        nav,
        error: req.flash("error")[0] || null,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("error", "Sorry, the registration failed due to an error.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      error: req.flash("error")[0] || null,
    });
  }
};

module.exports = {
  buildLogin: accountController.buildLogin,
  loginAccount: accountController.loginAccount,
  buildRegister,
  registerAccount: accountController.registerAccount,
  buildAccount: accountController.buildAccount
};
