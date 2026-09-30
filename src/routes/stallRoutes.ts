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
GET /api/stalls
Daftar kantin + search + pagination
*/
router.get('/', async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);

        const limit = Math.min(
            Math.max(Number(req.query.limit) || 10, 1),
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
                    attributes: ['id', 'name', 'email']
                }
            ],
            limit,
            offset,
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                limit,
                total: result.count,
                totalPages: Math.ceil(result.count / limit)
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data kantin'
        });
    }
});

/*
GET /api/stalls/:id
Detail kantin + owner + menu + review + user review
*/
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
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
                    attributes: ['id', 'name', 'email']
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
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name']
                        }
                    ],
                    attributes: [
                        'id',
                        'rating',
                        'comment',
                        'like_count',
                        'created_at',
                        'updated_at'
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

        res.json({
            success: true,
            data: stall
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail kantin'
        });
    }
});

export default router;