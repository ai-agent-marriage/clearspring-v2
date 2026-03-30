const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

// 管理员认证路由
try {
    const authRoutes = require('./auth');
    router.use('/auth', authRoutes);
    logger.info('Admin Auth route loaded');
} catch (err) {
    logger.error('Admin Auth route load failed', { error: err.message });
}

// 管理端路由
try {
    const ordersRoutes = require('./orders');
    router.use('/orders', ordersRoutes);
    logger.info('Admin Orders route loaded');
} catch (err) {
    logger.error('Admin Orders route load failed', { error: err.message });
}

try {
    const qualificationsRoutes = require('./qualifications');
    router.use('/qualifications', qualificationsRoutes);
    logger.info('Admin Qualifications route loaded');
} catch (err) {
    logger.error('Admin Qualifications route load failed', { error: err.message });
}

try {
    const executorsRoutes = require('./executors');
    router.use('/executors', executorsRoutes);
    logger.info('Admin Executors route loaded');
} catch (err) {
    logger.error('Admin Executors route load failed', { error: err.message });
}

try {
    const profitSharingRoutes = require('./profit-sharing');
    router.use('/profit-sharing', profitSharingRoutes);
    logger.info('Admin ProfitSharing route loaded');
} catch (err) {
    logger.error('Admin ProfitSharing route load failed', { error: err.message });
}

// 申诉仲裁路由
try {
    const appealsRoutes = require('./appeals');
    router.use('/appeals', appealsRoutes);
    logger.info('Admin Appeals route loaded');
} catch (err) {
    logger.error('Admin Appeals route load failed', { error: err.message });
}

// 数据统计路由
try {
    const dashboardRoutes = require('./dashboard');
    router.use('/dashboard', dashboardRoutes);
    logger.info('Admin Dashboard route loaded');
} catch (err) {
    logger.error('Admin Dashboard route load failed', { error: err.message });
}

// 数据导出路由
try {
    const exportRoutes = require('./export');
    router.use('/export', exportRoutes);
    // 添加别名路由以兼容旧版 API 路径
    router.use('/orders/export', exportRoutes);
    router.use('/executors/export', exportRoutes);
    router.use('/users/export', exportRoutes);
    router.use('/qualifications/export', exportRoutes);
    logger.info('Admin Export route loaded');
} catch (err) {
    logger.error('Admin Export route load failed', { error: err.message });
}

// 审计日志路由
try {
    const auditLogsRoutes = require('./audit-logs');
    router.use('/audit-logs', auditLogsRoutes);
    logger.info('Admin AuditLogs route loaded');
} catch (err) {
    logger.error('Admin AuditLogs route load failed', { error: err.message });
}

// 系统设置路由
try {
    const settingsRoutes = require('./settings');
    router.use('/settings', settingsRoutes);
    logger.info('Admin Settings route loaded');
} catch (err) {
    logger.error('Admin Settings route load failed', { error: err.message });
}

router.get('/', (req, res) => {
    res.json({ 
        code: 'SUCCESS',
        data: {
            endpoints: {
                // 认证
                login: 'POST /api/admin/auth/login',
                info: 'GET /api/admin/auth/info',
                logout: 'POST /api/admin/auth/logout',
                // 数据统计
                dashboardStats: 'GET /api/admin/dashboard/stats',
                dashboardRecentOrders: 'GET /api/admin/dashboard/recent-orders',
                // 订单管理
                orders: 'GET /api/admin/orders',
                ordersStatus: 'PUT /api/admin/orders/:id/status',
                // 资质审核
                qualifications: 'GET /api/admin/qualifications',
                qualificationsAudit: 'PUT /api/admin/qualifications/:id',
                // 申诉仲裁
                appeals: 'GET /api/admin/appeals',
                appealsArbitrate: 'PUT /api/admin/appeals/:id/arbitrate',
                // 执行者管理
                executors: 'GET /api/admin/executors',
                executorsStatus: 'PUT /api/admin/executors/:id/status',
                // 分账配置
                profitSharing: 'GET/PUT /api/admin/profit-sharing',
                // 数据导出
                export: 'GET /api/admin/export/*',
                // 系统设置
                settings: 'GET /api/admin/settings',
                // 操作日志
                logs: 'GET /api/admin/audit-logs'
            }
        },
        message: 'ClearSpring Admin API v2.0'
    });
});

module.exports = router;
