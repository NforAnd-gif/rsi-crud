import { Router } from 'express';
import { Review, Stall, User, Like, Flag } from '../models';
import { writeAuditLog } from '../utils/auditLog';

const router = Router();

/*
GET /api/stalls/:stallId/reviews
Daftar review sebuah kantin
*/
router.get('/stalls/:stallId/reviews', async (req, res) => {
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

        const reviews = await Review.findAll({
            where: {
                stall_id: stallId
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil review'
        });
    }
});

/*
POST /api/stalls/:stallId/reviews
Membuat review baru
*/
router.post('/stalls/:stallId/reviews', async (req, res) => {
    try {
        const stallId = Number(req.params.stallId);

        const {
        user_id,
        rating,
         comment
        } = req.body ?? {};

        if (!Number.isInteger(stallId) || stallId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID kantin tidak valid'
            });
        }

        if (!user_id || !rating) {
            return res.status(400).json({
                success: false,
                message: 'user_id dan rating wajib diisi'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating harus berada antara 1 sampai 5'
            });
        }

        const stall = await Stall.findByPk(stallId);

        if (!stall) {
            return res.status(404).json({
                success: false,
                message: 'Kantin tidak ditemukan'
            });
        }

        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const existingReview = await Review.findOne({
            where: {
                stall_id: stallId,
                user_id
            }
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: 'User sudah memberikan review untuk kantin ini'
            });
        }

        const review = await Review.create({
            stall_id: stallId,
            user_id,
            rating,
            comment: comment ?? null,
            like_count: 0,
            created_at: new Date(),
            updated_at: new Date()
        });

        await writeAuditLog({
        user_id,
        action: 'CREATE_REVIEW',
        target_table: 'REVIEWS',
        target_id: review.id,
        metadata: {
        stall_id: stallId,
        rating
            }
        });

        await updateStallRating(stallId);

        res.status(201).json({
            success: true,
            message: 'Review berhasil dibuat',
            data: review
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal membuat review'
        });
    }
});

/*
PUT /api/reviews/:id
Update review
*/
router.put('/reviews/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            rating,
            comment
        } = req.body;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review tidak ditemukan'
            });
        }

        if (
            rating !== undefined &&
            (rating < 1 || rating > 5)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Rating harus berada antara 1 sampai 5'
            });
        }

        await review.update({
            rating: rating ?? review.rating,
            comment: comment ?? review.comment,
            updated_at: new Date()
        });

        await updateStallRating(review.stall_id);

        res.json({
            success: true,
            message: 'Review berhasil diperbarui',
            data: review
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui review'
        });
    }
});

/*
DELETE /api/reviews/:id
Hapus review
*/
router.delete('/reviews/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review tidak ditemukan'
            });
        }

        const stallId = review.stall_id;

        await review.destroy();

        await updateStallRating(stallId);

        res.json({
            success: true,
            message: 'Review berhasil dihapus'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal menghapus review'
        });
    }
});

/*
POST /api/reviews/:id/like
Membuat like pada review
*/
router.post('/reviews/:id/like', async (req, res) => {
    try {
        const reviewId = Number(req.params.id);
        const { user_id } = req.body ?? {};

        if (!Number.isInteger(reviewId) || reviewId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID review tidak valid'
            });
        }

        if (!Number.isInteger(Number(user_id)) || Number(user_id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'user_id wajib diisi dengan ID yang valid'
            });
        }

        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review tidak ditemukan'
            });
        }

        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const existingLike = await Like.findOne({
            where: {
                review_id: reviewId,
                user_id
            }
        });

        if (existingLike) {
            return res.status(409).json({
                success: false,
                message: 'User sudah menyukai review ini'
            });
        }

        const like = await Like.create({
            review_id: reviewId,
            user_id,
            created_at: new Date()
        });

        await review.increment('like_count');

        res.status(201).json({
            success: true,
            message: 'Review berhasil disukai',
            data: like
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal membuat like'
        });
    }
});

/*
DELETE /api/reviews/:id/like
Menghapus like dari review
*/
router.delete('/reviews/:id/like', async (req, res) => {
    try {
        const reviewId = Number(req.params.id);
        const userId = Number(req.query.user_id);

        if (!Number.isInteger(reviewId) || reviewId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID review tidak valid'
            });
        }

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'user_id wajib diisi'
            });
        }

        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review tidak ditemukan'
            });
        }

        const like = await Like.findOne({
            where: {
                review_id: reviewId,
                user_id: userId
            }
        });

        if (!like) {
            return res.status(404).json({
                success: false,
                message: 'Like tidak ditemukan'
            });
        }

        await like.destroy();

        await review.decrement('like_count');

        res.json({
            success: true,
            message: 'Like berhasil dihapus'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal menghapus like'
        });
    }
});

/*
POST /api/reviews/:id/flag
Melaporkan review
*/
router.post('/reviews/:id/flag', async (req, res) => {
    try {
        const reviewId = Number(req.params.id);

        const {
            reported_by,
            reason
        } = req.body;

        if (!reported_by || !reason) {
            return res.status(400).json({
                success: false,
                message: 'reported_by dan reason wajib diisi'
            });
        }

        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review tidak ditemukan'
            });
        }

        const user = await User.findByPk(reported_by);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const flag = await Flag.create({
            review_id: reviewId,
            reported_by,
            reason,
            status: 'pending',
            created_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Review berhasil dilaporkan',
            data: flag
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal melaporkan review'
        });
    }
});

/*
Menghitung ulang rating kantin
*/
async function updateStallRating(stallId: number): Promise<void> {
    const reviews = await Review.findAll({
        where: {
            stall_id: stallId
        }
    });

    const reviewCount = reviews.length;

    const avgRating =
        reviewCount > 0
            ? reviews.reduce(
                  (total, review) =>
                      total + Number(review.rating),
                  0
              ) / reviewCount
            : 0;

    await Stall.update(
        {
            avg_rating: Number(avgRating.toFixed(2)),
            review_count: reviewCount
        },
        {
            where: {
                id: stallId
            }
        }
    );
}

export default router;