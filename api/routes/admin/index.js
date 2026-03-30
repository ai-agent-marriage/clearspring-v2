/**
 * 管理端 API 路由汇总
 */

const express = require('express');
const router = express.Router();

// 导入各模块路由
const adminOrderRoutes = require('./admin/orders');
const adminQualificationRoutes = require('./admin/qualifications');
const adminExecutorRoutes = require('./admin/executors');
const adminProfitSharingRoutes = require('./admin/profit-sharing');

// 注册路由
router.use(adminOrderRoutes);
router.use(adminQualificationRoutes);
router.use(adminExecutorRoutes);
router.use(adminProfitSharingRoutes);

module.exports = router;
