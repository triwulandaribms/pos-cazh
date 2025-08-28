const express = require("express");
const router = express.Router();
const { registrasiUsers, loginUsers } = require("../controller/user.js");
const authMiddleware = require("../middleware/auth.js");

const {
    getAllProduct,
    getProductById,
    addProduct,
    updateProductById,
    deleteProductById
} = require("../controller/product.js");

const {
    getAllHistoryTransactions,
    getTransactionsHistoryByDateTime,
    addSalesTransactions
} = require("../controller/salesTransactions.js");


router.post("/registrasi", registrasiUsers);
router.post("/login", loginUsers);
router.post("/registrasi-kasir", authMiddleware, registrasiUsers);
router.get("/get-all-product", authMiddleware, getAllProduct);
router.get("/get-product-by", authMiddleware, getProductById);
router.post("/add-product", authMiddleware, addProduct);
router.put("/update-product-by", authMiddleware, updateProductById);
router.delete("/delete-product-by", authMiddleware, deleteProductById);

router.post("/add-transaksi", authMiddleware, addSalesTransactions);
router.get("/get-all-history", authMiddleware, getAllHistoryTransactions);
router.get("/get-history-by", authMiddleware, getTransactionsHistoryByDateTime);

module.exports = router;
