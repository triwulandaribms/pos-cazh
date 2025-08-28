const express = require("express");
const router = express.Router();
const { registrasiUsers, loginUsers } = require("../controller/user.js");
const authMiddleware = require("../middleware/auth.js");

const {
    getAllProduct,
    getProductById
} = require("../controller/product.js");

const {
    addSalesTransactions,
    getTransactionsHistoryByDateTime,
    getAllHistoryTransactions,
} = require("../controller/salesTransactions.js");


router.post("/login", loginUsers);

router.get("/get-all-product", authMiddleware, getAllProduct);
router.get("/get-product-by", authMiddleware, getProductById);

router.post("/add-transaksi", authMiddleware, addSalesTransactions);
router.get("/get-all-history", authMiddleware, getAllHistoryTransactions);
router.get("/get-history-by", authMiddleware, getTransactionsHistoryByDateTime);

module.exports = router;
