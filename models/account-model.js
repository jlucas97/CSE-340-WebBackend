const pool = require("../database/");

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
  throw error
}}

/* *****************************
*   Get account by ID
* *************************** */
async function getAccountById(account_id) {
  try {
    const sql = `SELECT account_id, account_firstname, account_lastname, account_email, account_type
                 FROM account WHERE account_id = $1`
    const data = await pool.query(sql, [account_id])
    return data.rows[0]
  } catch (err) {
    console.error("getAccountById error:", err)
    return null
  }
}

/* *****************************
*   Get account by email
* *************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT * FROM account WHERE account_email = $1",
      [account_email]
    )
    return result.rows[0] // returns account object or undefined
  } catch (error) {
    console.error("DB Error (getAccountByEmail):", error.message)
    throw error
  }
}

/* ***************************
 *  Update Account Info
 * ************************** */
async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE public.account
      SET
        account_firstname = $1,
        account_lastname = $2,
        account_email = $3
      WHERE account_id = $4
      RETURNING *;
    `

    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id
    ])

    return result
  } catch (error) {
    throw error
  }
}


/* *****************************
*   Update account password
* *************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const data = await pool.query(sql, [hashedPassword, account_id]);
    return data;
  } catch (error) {
    console.error("updatePassword model error:", error);
    throw error;
  }
}



module.exports = {
  registerAccount,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updatePassword,
}