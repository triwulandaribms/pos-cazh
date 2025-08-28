const { salesTransactionsModel } = require("../model/salesTransactionsModel.js");
const { transactionsItemsModel } = require("../model/transactionsItemsModel.js");
const { productModel } = require("../model/productsModel.js");
const { usersModel } = require("../model/usersModel.js");
const { sequelize } = require("../config/db.js");
const { Op } = require("sequelize");


exports.addSalesTransactions = async (req, res) => {

    const transaksi = await sequelize.transaction();

    try {
        const { transaction_date, user_id, items } = req.body;

        const dataUser = await usersModel.findOne({ where: { id: user_id }, transaction: transaksi });
        if (!dataUser) {
            await transaksi.rollback();
            return res.status(400).json({ message: `Users dengan id ${user_id} tidak ditemukan.` });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Item transaksi wajib diisi." });
        }

        let totalAmount = 0;

        for (const item of items) {

            if (item.quantity <= 0) {
                await transaksi.rollback();
                return res.status(400).json({ message: `Quantity tidak boleh kurang dari 0.` });

            }

            const dataProduct = await productModel.findOne({
                where: {
                    id: item.product_id,
                    deletedAt: null,
                    status: true
                }, transaction: transaksi
            });

            if (!dataProduct || dataProduct.stock === 0 || dataProduct.status === false) {
                await transaksi.rollback();
                return res.status(400).json({ message: `Produk dengan id ${item.product_id} sudah habis atau tidak ditemukan.` });
            }

            if (dataProduct.stock < item.quantity) {
                await transaksi.rollback();
                return res.status(400).json({ message: `Stok produk ${dataProduct.name} dengan id ${dataProduct.id} tidak cukup.` });
            }

            totalAmount += dataProduct.price * item.quantity;
        }

        const transaction = await salesTransactionsModel.create({
            user_id: user_id,
            transaction_date: transaction_date,
            total_amount: totalAmount
        }, { transaction: transaksi });


        for (const item of items) {
            const product = await productModel.findOne({
                where: {
                    id: item.product_id
                }, transaction: transaksi
            });

            await transactionsItemsModel.create({
                sales_transactions_id: transaction.id,
                product_id: product.id,
                quantity: item.quantity,
                price: product.price
            }, { transaction: transaksi });

            await product.update({ stock: product.stock - item.quantity }, { transaction: transaksi });

            if (product.stock - item.quantity <= 0) {
                await product.update({ status: false, stock: 0 }, { transaction: transaksi });
            }
        }

        await transaksi.commit();

        return res.status(201).json({
            message: "Transaksi berhasil."
        });

    } catch (error) {
        await transaksi.rollback();
        console.error("Gagal melakukan transaksi:", error.message);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

exports.getAllHistoryTransactions = async (_req, res) => {

    try {
        const transactions = await salesTransactionsModel.findAll({
            attributes: ["id", "transaction_date", "total_amount", "user_id"],
            include: [
                {
                    model: transactionsItemsModel,
                    as: "items",
                    attributes: ["id", "sales_transactions_id", "product_id", "quantity"],
                    include: [
                        {
                            model: productModel,
                            as: "product",
                            attributes: ["code", "name", "price"]
                        }
                    ]
                },
                {
                    model: usersModel,
                    as: "user",
                    attributes: ["name", "role"]
                }
            ],
            order: [["transaction_date", "DESC"]]
        });

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ message: "Belum ada transaksi"});
        }

        const historyMap = {};

        transactions.forEach(data => {
            const group = `${data.transaction_date.toISOString()}_${data.user_id}`;

            if (!historyMap[group]) {
                historyMap[group] = {
                    transactions_date: data.transaction_date,
                    role: data.user.role,
                    name: data.user.name,
                    total_amount: 0,
                    products: {}
                };
            }

            historyMap[group].total_amount += data.total_amount;

            data.items.forEach(item => {
                const p = item.product;
                if (!historyMap[group].products[p.code]) {
                    historyMap[group].products[p.code] = {
                        code: p.code,
                        name: p.name,
                        price: p.price,
                        total_quantity: 0,
                        total_nominal: 0
                    };
                }

                historyMap[group].products[p.code].total_quantity += item.quantity;
                historyMap[group].products[p.code].total_nominal += item.quantity * p.price;
            });
        });

        const historyList = Object.values(historyMap).map(s => ({
            transactions_date: s.transactions_date,
            role: s.role,
            name: s.name,
            total_amount: s.total_amount,
            products: Object.values(s.products)
        }));

        return res.status(200).json({
            message: "Success",
            list: historyList
        });

    } catch (error) {
        console.error("Gagal membuat summary transaksi:", error.message);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

exports.getTransactionsHistoryByDateTime = async (req, res) => {
    try {
        const { transaction_date, start_time, end_time } = req.query;

        if (!transaction_date) {
            return res.status(400).json({ message: "Parameter transaction_date wajib diisi." });
        }

        const startTime = start_time || "00:00:00";
        const endTime = end_time || "23:59:59";

        const startDateTime = new Date(`${transaction_date}T${startTime}.000Z`);
        const endDateTime = new Date(`${transaction_date}T${endTime}.999Z`);

        const transactions = await salesTransactionsModel.findAll({
            where: {
                transaction_date: { [Op.between]: [startDateTime, endDateTime] },
                deletedAt: null
            },
            include: [
                {
                    model: transactionsItemsModel,
                    as: "items",
                    where: { deletedAt: null },
                    required: false,
                    include: [
                        { model: productModel, as: "product", attributes: ["code", "name", "price"] }
                    ]
                },
                {
                    model: usersModel,
                    as: "user",
                    attributes: ["name", "role"]
                }
            ],
            order: [["transaction_date", "DESC"]]
        });

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ message: "Belum ada transaksi." });
        }

        const historyMap = {};

        transactions.forEach(data => {
            const group = `${data.transaction_date.toISOString()}_${data.user_id}`;

            if (!historyMap[group]) {
                historyMap[group] = {
                    transactions_date: data.transaction_date,
                    role: data.user.role,
                    name: data.user.name,
                    total_amount: 0,
                    products: {}
                };
            }

            historyMap[group].total_amount += data.total_amount;

            data.items.forEach(item => {
                const p = item.product;
                if (!historyMap[group].products[p.code]) {
                    historyMap[group].products[p.code] = {
                        code: p.code,
                        name: p.name,
                        price: p.price,
                        total_quantity: 0,
                        total_nominal: 0
                    };
                }

                historyMap[group].products[p.code].total_quantity += item.quantity;
                historyMap[group].products[p.code].total_nominal += item.quantity * p.price;
            });
        });

        const historyList = Object.values(historyMap).map(s => ({
            transactions_date: s.transactions_date,
            role: s.role,
            name: s.name,
            total_amount: s.total_amount,
            products: Object.values(s.products)
        }));

        return res.status(200).json({
            message: "Success",
            list: historyList
        });

    } catch (error) {
        console.error("Gagal melihat histori transaksi berdasarkan tanggal & jam:", error.message);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};
