import { Router } from 'express';
import { Flag, Review, User } from '../models';

const router = Router();

/*
GET /api/flags
Daftar laporan review
*/
router.get('/', async (_req, res) => {
    try {
        const flags = await Flag.findAll({
            include: [
                {
                    model: Review,
                    as: 'review',
                    attributes: [
                        'id',
                        'stall_id',
                        'user_id',
                        'rating',
                        'comment'
                    ]
                },
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: flags
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil laporan'
        });
    }
});

/*
PUT /api/flags/:id
Mengubah status laporan
*/
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        const validStatuses = [
            'pending',
            'resolved',
            'dismissed'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    'Status harus pending, resolved, atau dismissed'
            });
        }

        const flag = await Flag.findByPk(id);

        if (!flag) {
            return res.status(404).json({
                success: false,
                message: 'Laporan tidak ditemukan'
            });
        }

        await flag.update({
            status
        });

        res.json({
            success: true,
            message: 'Status laporan berhasil diperbarui',
            data: flag
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui laporan'
        });
    }
});

export default router;