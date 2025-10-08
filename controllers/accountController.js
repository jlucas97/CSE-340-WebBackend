const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const accountController = {}

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      notice: req.flash("notice")[0] || null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
accountController.buildRegister = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
 *  Process Login
 * *************************************** */
accountController.loginAccount = async function (req, res) {
  const nav = await utilities.getNav()
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

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 3600000
    })

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
    const nav = await utilities.getNav()
    const accountData = res.locals.accountData
    res.render("account/management", {
      title: "Account Management",
      nav,
      accountData,
      success: req.flash("success")[0] || null,
      error: req.flash("error")[0] || null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult && regResult.rowCount > 0) {
      req.flash("success", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      return res.status(201).render("account/login", { title: "Login", nav })
    } else {
      req.flash("error", "Sorry, the registration failed.")
      return res.status(501).render("account/register", {
        title: "Register",
        nav,
        error: req.flash("error")[0] || null
      })
    }
  } catch (error) {
    console.error("Registration error:", error)
    req.flash("error", "Sorry, the registration failed due to an error.")
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      error: req.flash("error")[0] || null
    })
  }
}

/* **********************************
 * Deliver Update Account View
 * ********************************* */
accountController.buildUpdateAccount = async function (req, res, next) {
  try {
    const account_id = parseInt(req.params.account_id)
    const nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)

    if (!accountData) {
      req.flash("error", "Account not found.")
      return res.redirect("/account/")
    }

    res.render("account/update", {
      title: "Update Account",
      nav,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      errors: null,
      success: null
    })
  } catch (error) {
    next(error)
  }
}

/* **********************************
 *  Process Account Information Update
 * ********************************* */
accountController.updateAccountInfo = async function (req, res, next) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    const nav = await utilities.getNav()
    const updateResult = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updateResult && updateResult.rowCount > 0) {
      const updatedAccount = updateResult.rows[0]
      delete updatedAccount.account_password
      const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600000
      })
      req.flash("success", "Account information successfully updated.")
      return res.redirect("/account/")
    } else {
      req.flash("error", "Update failed. Please try again.")
      return res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        errors: [{ msg: "Account update failed." }],
        account_id,
        account_firstname,
        account_lastname,
        account_email
      })
    }
  } catch (error) {
    console.error("updateAccountInfo error:", error)
    const nav = await utilities.getNav()
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: [{ msg: "Server error while updating account." }],
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email
    })
  }
}

/* **********************************
 *  Process Password Change
 * ********************************* */
accountController.updatePassword = async function (req, res, next) {
  try {
    const { account_id, account_password } = req.body;
    const nav = await utilities.getNav();

    // Hash the new password
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const result = await accountModel.updatePassword(account_id, hashedPassword);

    if (result.rowCount > 0) {
      req.flash("success", "Password updated successfully.");
      const updatedAccount = await accountModel.getAccountById(account_id);
      return res.status(200).render("account/management", {
        title: "Account Management",
        nav,
        accountData: updatedAccount,
        success: req.flash("success")[0],
        error: null,
      });
    } else {
      req.flash("error", "Password update failed.");
      return res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        errors: [{ msg: "Password update failed." }],
        accountData: { account_id },
      });
    }
  } catch (error) {
    console.error("updatePassword error:", error);
    const nav = await utilities.getNav();
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: [{ msg: "Server error while updating password." }],
      accountData: req.body,
    });
  }
};


module.exports = {
  buildLogin: accountController.buildLogin,
  loginAccount: accountController.loginAccount,
  buildRegister: accountController.buildRegister,
  registerAccount: accountController.registerAccount,
  buildAccount: accountController.buildAccount,
  buildUpdateAccount: accountController.buildUpdateAccount,
  updateAccountInfo: accountController.updateAccountInfo,
  updatePassword: accountController.updatePassword
}
