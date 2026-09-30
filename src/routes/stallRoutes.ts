import { Router } from 'express';
import { Op } from 'sequelize';

import {
    Stall,
    User,
    MenuItem,
    Review
} from '../models';

const router = Router();

/*
==================================================
GET /api/stalls
Daftar semua kantin
+ Search
+ Pagination
==================================================
*/
router.get('/', async (req, res) => {
    try {
        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            100
        );

        const offset = (page - 1) * limit;

        const search =
            typeof req.query.search === 'string'
                ? req.query.search.trim()
                : '';

        const where = search
            ? {
                  [Op.or]: [
                      {
                          name: {
                              [Op.like]: `%${search}%`
                          }
                      },
                      {
                          category: {
                              [Op.like]: `%${search}%`
                          }
                      }
                  ]
              }
            : undefined;

        const result = await Stall.findAndCountAll({
            where,

            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: [
                        'id',
                        'name',
                        'email'
                    ]
                }
            ],

            limit,
            offset,

            order: [
                ['id', 'ASC']
            ]
        });

        return res.status(200).json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                limit,
                total: result.count,
                totalPages: Math.ceil(
                    result.count / limit
                )
            }
        });

    } catch (error) {
        console.error(
            'GET STALLS ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil data kantin'
        });
    }
});


/*
==================================================
POST /api/stalls
Membuat kantin baru
==================================================
*/
router.post('/', async (req, res) => {
    try {
        const {
            owner_id,
            name,
            category,
            location,
            description
        } = req.body ?? {};

        const ownerId = Number(owner_id);

        // Validasi input
        if (
            !Number.isInteger(ownerId) ||
            ownerId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'owner_id wajib berupa ID yang valid'
            });
        }

        if (
            typeof name !== 'string' ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'name wajib diisi'
            });
        }

        if (
            typeof category !== 'string' ||
            !category.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'category wajib diisi'
            });
        }

        // Cek owner
        const owner = await User.findByPk(ownerId);

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: 'Owner tidak ditemukan'
            });
        }

        // Membuat data stall
        const stall = await Stall.create({
            owner_id: ownerId,
            name: name.trim(),
            category: category.trim(),
            location:
                typeof location === 'string'
                    ? location.trim()
                    : null,
            description:
                typeof description === 'string'
                    ? description.trim()
                    : null,
            avg_rating: 0,
            review_count: 0,
            created_at: new Date()
        });

        return res.status(201).json({
            success: true,
            message: 'Kantin berhasil dibuat',
            data: stall
        });

    } catch (error) {
        console.error(
            'POST STALL ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Gagal membuat kantin',
            error:
                error instanceof Error
                    ? error.message
                    : String(error)
        });
    }
});


/*
==================================================
GET /api/stalls/:id
Detail kantin
+ Owner
+ Menu
+ Reviews
+ User review
==================================================
*/
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'ID kantin tidak valid'
            });
        }

        const stall = await Stall.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: [
                        'id',
                        'name',
                        'email'
                    ]
                },

                {
                    model: MenuItem,
                    as: 'menuItems',
                    attributes: [
                        'id',
                        'name',
                        'price',
                        'is_available'
                    ]
                },

                {
                    model: Review,
                    as: 'reviews',

                    attributes: [
                        'id',
                        'rating',
                        'comment',
                        'like_count',
                        'created_at',
                        'updated_at'
                    ],

                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: [
                                'id',
                                'name'
                            ]
                        }
                    ]
                }
            ]
        });

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: 'Kantin tidak ditemukan'
            });
        }

        return res.status(200).json({
            success: true,
            data: stall
        });

    } catch (error) {
        console.error(
            'GET STALL DETAIL ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail kantin'
        });
    }
});


/*
==================================================
PUT /api/stalls/:id
Mengubah data kantin
==================================================
*/
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'ID kantin tidak valid'
            });
        }

        const stall = await Stall.findByPk(id);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: 'Kantin tidak ditemukan'
            });
        }

        const {
            owner_id,
            name,
            category,
            location,
            description
        } = req.body ?? {};

        // Jika owner_id dikirim, cek owner
        if (owner_id !== undefined) {
            const ownerId = Number(owner_id);

            if (
                !Number.isInteger(ownerId) ||
                ownerId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'owner_id tidak valid'
                });
            }

            const owner = await User.findByPk(ownerId);

            if (!owner) {
                return res.status(404).json({
                    success: false,
                    message: 'Owner tidak ditemukan'
                });
            }

            stall.owner_id = ownerId;
        }

        if (name !== undefined) {
            if (
                typeof name !== 'string' ||
                !name.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'name tidak valid'
                });
            }

            stall.name = name.trim();
        }

        if (category !== undefined) {
            if (
                typeof category !== 'string' ||
                !category.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'category tidak valid'
                });
            }

            stall.category = category.trim();
        }

        if (location !== undefined) {
            stall.location =
                typeof location === 'string'
                    ? location.trim()
                    : null;
        }

        if (description !== undefined) {
            stall.description =
                typeof description === 'string'
                    ? description.trim()
                    : null;
        }

        await stall.save();

        return res.status(200).json({
            success: true,
            message: 'Data kantin berhasil diperbarui',
            data: stall
        });

    } catch (error) {
        console.error(
            'PUT STALL ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui data kantin',
            error:
                error instanceof Error
                    ? error.message
                    : String(error)
        });
    }
});


/*
==================================================
DELETE /api/stalls/:id
Menghapus kantin
==================================================
*/
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'ID kantin tidak valid'
            });
        }

        const stall = await Stall.findByPk(id);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: 'Kantin tidak ditemukan'
            });
        }

        await stall.destroy();

        return res.status(200).json({
            success: true,
            message: 'Kantin berhasil dihapus'
        });

    } catch (error) {
        console.error(
            'DELETE STALL ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus kantin',
            error:
                error instanceof Error
                    ? error.message
                    : String(error)
        });
    }
});


export default router;