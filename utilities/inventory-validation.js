const { body, validationResult } = require("express-validator")
const utilities = require(".")

const validate = {}

/*  Classification rules  */
validate.classificationRules = () => [
  body("classification_name")
    .trim()
    .notEmpty().withMessage("Classification name is required.").bail()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("No spaces or special characters are allowed (letters/numbers only).")
]

/*  Handle classification validation  */
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      classification_name: req.body.classification_name,
      notice: null
    })
  }
  next()
}

/*  Inventory rules  */
validate.inventoryRules = () => [
  body("classification_id")
    .notEmpty().withMessage("Please choose a classification.")
    .isInt().withMessage("Classification is invalid."),

  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),

  body("inv_year")
    .notEmpty().withMessage("Year is required.")
    .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
    .withMessage("Year must be valid."),

  body("inv_description")
    .trim()
    .notEmpty().withMessage("Description is required.")
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters."),

  body("inv_image")
    .trim().notEmpty().withMessage("Image path is required."),

  body("inv_thumbnail")
    .trim().notEmpty().withMessage("Thumbnail path is required."),

  body("inv_price")
    .notEmpty().withMessage("Price is required.")
    .isFloat({ gt: 0 }).withMessage("Price must be a positive number."),

  body("inv_miles")
    .notEmpty().withMessage("Miles is required.")
    .isInt({ min: 0 }).withMessage("Miles must be a non-negative integer."),

  body("inv_color")
    .trim().notEmpty().withMessage("Color is required."),
]

/*  Handle inventory validation  */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: errors.array(),
      notice: null,
      classificationList,
      ...req.body
    })
  }
  next()
}

/* ***************************
 * Check data and return to edit view
 *************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body

  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`

    return res.status(400).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: errors.array(),
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
  next()
}



module.exports = validate
