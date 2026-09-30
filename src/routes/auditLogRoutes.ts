import { Router } from 'express';
import { AuditLog } from '../models';

const router = Router();

/*
GET /api/audit-logs
Daftar audit log
*/
router.get('/', async (_req, res) => {
    try {
        const logs = await AuditLog.findAll({
            order: [['id', 'DESC']]
        });

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil audit log'
        });
    }
});

/*
POST /api/audit-logs
Membuat audit log
*/
router.post('/', async (req, res) => {
    try {
        const {
            user_id,
            action,
            target_table,
            target_id,
            metadata
        } = req.body ?? {};

        if (!action || !target_table) {
            return res.status(400).json({
                success: false,
                message: 'action dan target_table wajib diisi'
            });
        }

        const log = await AuditLog.create({
            user_id: user_id ?? null,
            action,
            target_table,
            target_id: target_id ?? null,
            metadata:
                typeof metadata === 'string'
                    ? metadata
                    : metadata
                        ? JSON.stringify(metadata)
                        : null,
            created_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Audit log berhasil dibuat',
            data: log
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal membuat audit log'
        });
    }
});

export default router;