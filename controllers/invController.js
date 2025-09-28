const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

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
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      notice: req.flash("notice")?.[0] || null,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: "",
      notice: null,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Insert classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    const result = await invModel.addClassification(classification_name);

    if (result.rowCount > 0) {
      // Rebuild nav so the new classification shows immediately
      const nav = await utilities.getNav();
      req.flash("notice", `Classification "${classification_name}" added.`);
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        notice: req.flash("notice")[0] || null,
      });
    }

    const nav = await utilities.getNav();
    req.flash("notice", "Failed to add classification.");
    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: [{ msg: "Failed to add classification." }],
      classification_name,
      notice: req.flash("notice")[0] || null,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      classificationList,
      notice: req.flash("notice")[0] || null,
      // sticky defaults
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Insert inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });

    if (result.rowCount > 0) {
      const nav = await utilities.getNav(); // refresh nav
      req.flash("notice", `Inventory item "${inv_make} ${inv_model}" added.`);
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        notice: req.flash("notice")[0] || null,
      });
    }

    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    req.flash("notice", "Failed to add inventory item.");
    return res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: [{ msg: "Failed to add inventory item." }],
      classificationList,
      ...req.body,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Trigger Error 500
 * ************************** */

invCont.triggerError = async function (req, res, next) {
  try {
    throw new Error("This is a forced error.");
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
