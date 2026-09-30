import { Router } from 'express';
import { User } from '../models';

const router = Router();

/*
GET /api/users
Daftar user
*/
router.get('/', async (_req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                'id',
                'name',
                'email',
                'role',
                'created_at'
            ],
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data user'
        });
    }
});

/*
POST /api/users
Membuat user baru
*/
router.post('/', async (req, res) => {
    try {
        const {
            name,
            email,
            password_hash,
            role
        } = req.body ?? {};

        if (
            !name ||
            !email ||
            !password_hash ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'name, email, password_hash, dan role wajib diisi'
            });
        }

        const validRoles = [
            'admin',
            'owner',
            'customer'
        ];

        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message:
                    'role harus admin, owner, atau customer'
            });
        }

        const existingUser = await User.findOne({
            where: {
                email
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email sudah digunakan'
            });
        }

        const user = await User.create({
            name,
            email,
            password_hash,
            role,
            created_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'User berhasil dibuat',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal membuat user'
        });
    }
});

export default router;