const { usersModel } = require('../model/usersModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registrasiUsers = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const cekEmail = await usersModel.findOne({ where: { email } });
        
        if (cekEmail) {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }

        const adminCount = await usersModel.count({ where: { role: 'admin' } });

        let cekRole;

        if (!role || role === 'kasir') {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: "Hanya admin yang bisa menambahkan kasir" });
            }

            cekRole = 'kasir';

        } else if (role === 'admin') {
            if (adminCount === 0) {

                cekRole = 'admin';

            } else {

                if (!req.user || req.user.role !== 'admin') {
                    return res.status(403).json({ message: "Hanya admin yang bisa menambahkan admin baru" });
                }

                cekRole = 'admin';
            }
        } else {
            return res.status(400).json({ message: "Role tidak valid" });
        }

        const dataUsers = await usersModel.findAll({ attributes: ['password'] });

        for (const akun of dataUsers) {
            const cekPassword = await bcrypt.compare(password, akun.password);
            if (cekPassword) return res.status(400).json({ message: "Password sudah pernah dipakai" });
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);

        await usersModel.create({
            name,
            email,
            password: hash,
            role: cekRole
        });

        res.status(201).json({ message: `${cekRole} berhasil registrasi` });

    } catch (error) {
        console.error("Gagal mendaftar:", error.message);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

exports.loginUsers = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await usersModel.findOne({
            where: { email },
            attributes: ['id', 'name', 'email', 'password', 'role']
        });

        if (!user) {
            return res.status(404).json({ message: "Email tidak ditemukan" });
        }

        const hash = await bcrypt.compare(password, user.password);

        if (!hash){
            return res.status(401).json({ message: "Password salah" });
        }

        const dataJwt = jwt.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }, process.env.SECRET_KEY);

        res.status(200).json({ message: "Berhasil login", token: dataJwt });

    } catch (error) {
        console.error("Gagal login:", error.message);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};
