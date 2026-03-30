const express = require('express');
const router = express.Router();

// 管理端路由
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

router.get('/', (req, res) => {
    res.json({ message: 'Admin route ok' });
});

module.exports = router;
