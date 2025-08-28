const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");

const usersModel = sequelize.define(
  "Users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
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
    tableName: "Users",
    timestamps: false
  }
);


module.exports = { usersModel };