const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

const accountController = {}

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
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
      // No account with that email
      req.flash("notice", "Invalid email or password. Please try again.")
      return res.status(401).render("account/login", { title: "Login", nav, notice: req.flash("notice")[0] })
    }

    //Check if password matches
    if (account_password !== accountData.account_password) {
      req.flash("notice", "Invalid email or password. Please try again.")
      return res.status(401).render("account/login", { title: "Login", nav, notice: req.flash("notice")[0] })
    }

    req.flash("notice", `Welcome back, ${accountData.account_firstname}!`)
    return res.redirect("/")
  } catch (error) {
    console.error("Login error:", error.message)
    req.flash("notice", "Something went wrong during login.")
    return res.status(500).render("account/login", { title: "Login", nav })
  }
}



/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  console.log("Form data:", req.body)

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult && regResult.rowCount > 0) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Register",
      nav,
    })
  }
}



module.exports = {
  buildLogin: accountController.buildLogin,
  loginAccount: accountController.loginAccount,
  buildRegister,
  registerAccount: accountController.registerAccount
}