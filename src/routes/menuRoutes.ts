import { Router } from 'express';
import { MenuItem, Stall } from '../models';

const router = Router();

/*
GET /api/stalls/:stallId/menu
Daftar menu sebuah kantin
*/
router.get('/stalls/:stallId/menu', async (req, res) => {
    try {
        const stallId = Number(req.params.stallId);

        if (!Number.isInteger(stallId) || stallId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID kantin tidak valid'
            });
        }

        const stall = await Stall.findByPk(stallId);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: 'Kantin tidak ditemukan'
            });
        }

        const menu = await MenuItem.findAll({
            where: {
                stall_id: stallId
            },
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            data: menu
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil menu'
        });
    }
});

/*
POST /api/stalls/:stallId/menu
Tambah menu
*/
router.post('/stalls/:stallId/menu', async (req, res) => {
    try {
        const stallId = Number(req.params.stallId);

        const {
            name,
            price,
            is_available
        } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'name dan price wajib diisi'
            });
        }

        const stall = await Stall.findByPk(stallId);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: 'Kantin tidak ditemukan'
            });
        }

        if (Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: 'Harga tidak boleh negatif'
            });
        }

        const menu = await MenuItem.create({
            stall_id: stallId,
            name,
            price,
            is_available:
                is_available !== undefined
                    ? is_available
                    : true
        });

        res.status(201).json({
            success: true,
            message: 'Menu berhasil ditambahkan',
            data: menu
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan menu'
        });
    }
});

/*
PUT /api/menu/:id
Update menu
*/
router.put('/menu/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        const menu = await MenuItem.findByPk(id);

        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menu tidak ditemukan'
            });
        }

        const {
            name,
            price,
            is_available
        } = req.body;

        if (price !== undefined && Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: 'Harga tidak boleh negatif'
            });
        }

        await menu.update({
            name: name ?? menu.name,
            price: price ?? menu.price,
            is_available:
                is_available ?? menu.is_available
        });

        res.json({
            success: true,
            message: 'Menu berhasil diperbarui',
            data: menu
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui menu'
        });
    }
});

/*
DELETE /api/menu/:id
Hapus menu
*/
router.delete('/menu/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        const menu = await MenuItem.findByPk(id);

        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menu tidak ditemukan'
            });
        }

        await menu.destroy();

        res.json({
            success: true,
            message: 'Menu berhasil dihapus'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal menghapus menu'
        });
    }
});

export default router;