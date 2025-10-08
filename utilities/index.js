const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the vehicle detail view HTML
* ************************************ */
Util.buildDetailView = async function(vehicle) {
  let detail = "";
  if (vehicle) {
    detail += '<div class="vehicle-detail">';
    detail += `<img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">`;
    detail += '<div class="vehicle-info">';
    detail += `<h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>`;
    detail += `<p class="price">Price: $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</p>`;
    detail += `<p class="description">${vehicle.inv_description}</p>`;
    detail += `<p>Color: ${vehicle.inv_color}</p>`;
    detail += `<p>Miles: ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)}</p>`;
    detail += '</div></div>';
  } else {
    detail += '<p class="notice">Sorry, vehicle not found.</p>';
  }
  return detail;
};

/* ************************
 * Constructs the classification select list
 * ************************** */

Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt
  if (!token) {
    res.locals.loggedin = 0
    return next()
  }

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    res.locals.accountData = payload
    res.locals.loggedin = 1
  } catch (err) {
    console.log("JWT verification failed:", err.message)
    res.clearCookie("jwt")
    res.locals.loggedin = 0
  }
  next()
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /* ****************************************
 * Require Employee or Admin for inventory admin areas
 * **************************************** */
Util.checkAccountType = (req, res, next) => {
  try {
    // If JWT was valid, these will exist:
    const logged = res.locals.loggedin
    const acct = res.locals.accountData

    if (!logged || !acct) {
      req.flash("notice", "Please log in")
      return res.redirect("/account/login")
    }

    const allowed = acct.account_type === "Employee" || acct.account_type === "Admin"
    if (!allowed) {
      req.flash("notice", "You are not authorized to access Inventory Management.")
      return res.redirect("/account/login")
    }

    next()
  } catch (e) {
    next(e)
  }
}


module.exports = Util