import express from 'express';

import userRoutes from './routes/userRoutes';
import stallRoutes from './routes/stallRoutes';
import reviewRoutes from './routes/reviewRoutes';
import menuRoutes from './routes/menuRoutes';
import flagRoutes from './routes/flagRoutes';
import auditLogRoutes from './routes/auditLogRoutes';

const app = express();

app.use(express.json());

// Root
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Review Kantin API is running'
    });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/stalls', stallRoutes);
app.use('/api', reviewRoutes);
app.use('/api', menuRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// 404
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

export default app;