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

    const classificationList = await utilities.buildClassificationList()

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
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
      const nav = await utilities.getNav(); 
      req.flash("notice", `Inventory item "${inv_make} ${inv_model}" added.`);
      return res.redirect("/inv/");
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData && invData[0] && invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)

    const classificationList = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    return res.redirect("/inv/")
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    return res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: null,
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
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirm = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Delete inventory item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id)
    const result = await invModel.deleteInventoryItem(inv_id)

    if (result && result.rowCount > 0) {
      req.flash("notice", "The vehicle was successfully deleted.")
      res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, the delete failed.")
      res.redirect("/inv/delete/" + inv_id)
    }
  } catch (error) {
    next(error)
  }
}





module.exports = invCont;
