const express = require('express');
const router = express.Router();

// 管理端路由
try {
    const authRoutes = require('./auth');
    router.use('/auth', authRoutes);
    console.log('✅ Admin Auth route loaded');
} catch (err) {
    console.error('❌ Admin Auth route load failed:', err.message);
}

try {
    const ordersRoutes = require('./orders');
    router.use('/orders', ordersRoutes);
    console.log('✅ Admin Orders route loaded');
} catch (err) {
    console.error('❌ Admin Orders route load failed:', err.message);
}

try {
    const qualificationsRoutes = require('./qualifications');
    router.use('/qualifications', qualificationsRoutes);
    console.log('✅ Admin Qualifications route loaded');
} catch (err) {
    console.error('❌ Admin Qualifications route load failed:', err.message);
}

try {
    const executorsRoutes = require('./executors');
    router.use('/executors', executorsRoutes);
    console.log('✅ Admin Executors route loaded');
} catch (err) {
    console.error('❌ Admin Executors route load failed:', err.message);
}

try {
    const profitSharingRoutes = require('./profit-sharing');
    router.use('/profit-sharing', profitSharingRoutes);
    console.log('✅ Admin ProfitSharing route loaded');
} catch (err) {
    console.error('❌ Admin ProfitSharing route load failed:', err.message);
}

try {
    const adminsRoutes = require('./admins');
    router.use('/admins', adminsRoutes);
    console.log('✅ Admin Admins route loaded');
} catch (err) {
    console.error('❌ Admin Admins route load failed:', err.message);
}

try {
    const auditLogsRoutes = require('./audit-logs');
    router.use('/audit-logs', auditLogsRoutes);
    console.log('✅ Admin AuditLogs route loaded');
} catch (err) {
    console.error('❌ Admin AuditLogs route load failed:', err.message);
}

try {
    const dashboardRoutes = require('./dashboard');
    router.use('/dashboard', dashboardRoutes);
    console.log('✅ Admin Dashboard route loaded');
} catch (err) {
    console.error('❌ Admin Dashboard route load failed:', err.message);
}

try {
    const exportRoutes = require('./export');
    router.use('/export', exportRoutes);
    console.log('✅ Admin Export route loaded');
} catch (err) {
    console.error('❌ Admin Export route load failed:', err.message);
}

router.get('/', (req, res) => {
    res.json({ 
        message: 'ClearSpring Admin API v2.0',
        version: '2.0.0',
        endpoints: {
            auth: '/api/admin/auth',
            orders: '/api/admin/orders',
            qualifications: '/api/admin/qualifications',
            executors: '/api/admin/executors',
            profitSharing: '/api/admin/profit-sharing',
            admins: '/api/admin/admins',
            auditLogs: '/api/admin/audit-logs',
            dashboard: '/api/admin/dashboard',
            export: '/api/admin/export'
        }
    });
});

module.exports = router;
