const { sequelize } = require("../config/db.js");
const { DataTypes } = require("sequelize");
const { SalesTransactions } = require("./salesTransactionsModel.js");
const { Products } = require("./productsModel.js");

const transactionsItemsModel = sequelize.define(
    "TransactionsItems",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        sales_transactions_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: SalesTransactions,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Products,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: null,
        },
        deletedAt: {
            type: DataTypes.DATE,
        },

    },
    {
        tableName: "TransactionsItems",
        timestamps: false
    }
);


module.exports = { transactionsItemsModel };