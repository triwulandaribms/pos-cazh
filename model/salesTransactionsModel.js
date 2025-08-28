const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");
const { Users } = require("./usersModel.js");

const salesTransactionsModel = sequelize.define(
  "SalesTransactions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: Users,
          key: "id",
      },
      onDelete: "CASCADE",
  },
    total_amount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    deletedAt:{
      type: DataTypes.DATE,
    },
  
  },
  {
    tableName: "SalesTransactions",
    timestamps: false
  }
);


module.exports = { salesTransactionsModel };