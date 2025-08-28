const { productModel } = require('../model/productsModel.js');
const { Op } = require("sequelize");



exports.getAllProduct = async (_req, res) => {
    try {

        const dataProducts = await productModel.findAll({
            where: { deletedAt: null }, 
            order: [["id", "ASC"]],
          });

          const data = dataProducts.map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            price: p.price, 
            stock: p.stock,
            status: p.status,
          }));

          return res.status(200).json({
            message: "Succes.",
            data,
          });

    } catch (error) {
        console.error("Gagal melihat produk:", error.message);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

exports.getProductById = async (req, res) => {
    try {
      const { id } = req.query; 
  
      if (!id ) {
        return res.status(400).json({ message: "Parameter id wajib diisi." });
      }
  
      const dataProduct = await productModel.findOne({
        where: { 
            id, 
            deletedAt: null 
        }, 
      });
  
      if (!dataProduct) {
        return res.status(404).json({ message: "Produk tidak ditemukan." });
      }
  
      return res.status(200).json({
        message: "Succes.",
        data: {
          id: dataProduct.id,
          name: dataProduct.name,
          code: dataProduct.code,
          price: dataProduct.price,
          stock: dataProduct.stock,
          status: dataProduct.status,
        },
      });
    } catch (error) {
      console.error("Gagal melihat produk:", error.message);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

exports.addProduct = async (req, res) => {
    try {
        
        const { name, code, price, stock} = req.body;

        if (!name || !code || !price || !stock ) {
          return res.status(400).json({ message: "field wajib diisi." });
        }

        if(stock !== undefined && stock < 0){
          return res.status(400).json({ message: "Stock tidak boleh kurang dari 0." });
        }

        if(price < 0){
          return res.status(400).json({ message: "Price tidak boleh kurang dari 0." });
        }

        const cekCode = await productModel.findOne({ 
            where: { 
                code,
                deletedAt: null,
             } 
            });
        if (cekCode) {
          return res.status(400).json({ message: "Kode produk sudah pernah digunakan." });
        }
    
        await productModel.create({
          name,
          code,
          price,
          stock,
          createdAt: new Date()
        });
    
        return res.status(201).json({
          message: "Berhasil tambah produk."
        });
    } catch (error) {
        console.error("Gagal menambah produk:", error.message);
        res.status(500).json({ message: "Terjadi kesalahan server" });

    }
};

exports.updateProductById = async (req, res) => {
  try {
    const { id } = req.query; 
    const { name, code, price, stock } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Parameter id wajib diisi." });
    }

    const dataProduct = await productModel.findOne({
      where: { id, deletedAt: null }
    });

    if (!dataProduct) {
      return res.status(404).json({ message: `Produk dengan id ${id} tidak ditemukan.` });
    }

    if (code && code !== dataProduct.code) {
      const cekProduct = await productModel.findOne({
        where: {
          code,
          deletedAt: null,
          id: { [Op.ne]: id } 
        }
      });

      if (cekProduct) {
        return res.status(400).json({ message: "Kode produk sudah digunakan produk lain." });
      }
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ message: "Stock tidak boleh kurang dari 0." });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price tidak boleh kurang dari 0." });
    }

    await dataProduct.update({
      name: name !== undefined ? name : dataProduct.name,
      code: code !== undefined ? code : dataProduct.code,
      price: price !== undefined ? price : dataProduct.price,
      stock: stock !== undefined ? stock : dataProduct.stock,
      updatedAt: new Date()
    });

    return res.status(200).json({
      message: `Berhasil update produk dengan id ${id}`
    });

  } catch (error) {
    console.error("Gagal update produk:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.deleteProductById = async (req, res) => {
  try {

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Parameter id wajib diisi." });
    }

    const dataProduct = await productModel.findOne({
      where: { 
        id, 
        deletedAt: null 
      }
    });

    if (!dataProduct) {
      return res.status(404).json({ message: "Produk tidak ditemukan atau sudah dihapus." });
    }

    await dataProduct.update({ 
        deletedAt: new Date() 
    });

    return res.status(200).json({
      message: `Berhasil menghapus produk dengan id ${id}`,
    });

  } catch (error) {
    console.error("Gagal menghapus produk:", error.message);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

