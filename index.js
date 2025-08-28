const express = require("express");
const { syncDatabase } = require("./model/relasi.js");
const { sequelize } = require("./config/db.js");
const adminRoutes = require("./routes/admin.routes.js");
const kasirRoutes = require("./routes/kasir.routes.js");

const app = express();
app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/kasir', kasirRoutes);

(async () => {
  try {

    try {

      await sequelize.authenticate();
      console.log('Terhubung ke basis data');
  
    } catch (error) {
      console.error('Gagal terhubung ke basis data:', error.message);
    }

    await syncDatabase();

    app.listen(3000, () => {
      console.log('Server berjalan di port 3000');
    });

  } catch (error) {
    console.error('Gagal setup awal:', error.message);
  }
})();