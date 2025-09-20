const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build individual vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  try {
    const invId = parseInt(req.params.inv_id);
    const data = await invModel.getVehicleById(invId);
    const grid = await utilities.buildDetailView(data);
    let nav = await utilities.getNav();
    const title = `${data.inv_make} ${data.inv_model}`;
    res.render("./inventory/detail", {
      title,
      nav,
      grid
    });
  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Trigger Error 500
 * ************************** */


invCont.triggerError = async function (req, res, next) {
  try {
    throw new Error("This is a forced error.");
  } catch (error) {
    next(error);
  }
}


module.exports = invCont