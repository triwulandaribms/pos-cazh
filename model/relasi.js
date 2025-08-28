const { sequelize } = require("../config/db.js");
const { productModel } = require("./productsModel.js");
const { salesTransactionsModel } = require("./salesTransactionsModel.js");
const { transactionsItemsModel } = require("./transactionsItemsModel.js");
const { usersModel } = require("./usersModel.js");


usersModel.hasMany(salesTransactionsModel, { foreignKey: "user_id", as: "transactions" });
salesTransactionsModel.belongsTo(usersModel, { foreignKey: "user_id", as: "user" });

salesTransactionsModel.hasMany(transactionsItemsModel, { foreignKey: "sales_transactions_id",  as: "items" });
transactionsItemsModel.belongsTo(salesTransactionsModel, { foreignKey: "sales_transactions_id",  as: "transaction"});

productModel.hasMany(transactionsItemsModel, { foreignKey: "product_id",  as: "items" });
transactionsItemsModel.belongsTo(productModel, { foreignKey: "product_id",   as: "product"});



async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log("sinkronisasi sukses");
  } catch (err) {
    console.error("sinkronisasi gagal:", err);
  }
}



module.exports = {
    syncDatabase,
    productModel,
    salesTransactionsModel,
    transactionsItemsModel
  };