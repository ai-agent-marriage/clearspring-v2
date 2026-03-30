/**
 * 清如 ClearSpring V2.0 - 内容生态 API
 * 包含：内容管理、冥想模块、仪轨学习
 */

const express = require('express');
const router = express.Router();

// 内容管理路由（admin-pc 使用）
try {
    const wikiRoutes = require('./wiki');
    router.use('/admin/wiki', wikiRoutes);
    console.log('✅ Content Wiki Admin route loaded');
} catch (err) {
    console.error('❌ Content Wiki Admin route load failed:', err.message);
}

// 冥想模块路由
try {
    const meditationRoutes = require('./meditation');
    router.use('/meditation', meditationRoutes);
    console.log('✅ Content Meditation route loaded');
} catch (err) {
    console.error('❌ Content Meditation route load failed:', err.message);
}

// 仪轨学习路由
try {
    const ritualRoutes = require('./ritual');
    router.use('/ritual', ritualRoutes);
    console.log('✅ Content Ritual route loaded');
} catch (err) {
    console.error('❌ Content Ritual route load failed:', err.message);
}

// 根路由
router.get('/', (req, res) => {
    res.json({ 
        message: 'ClearSpring Content API v2.0',
        version: '2.0.0',
        endpoints: {
            admin: {
                wiki: {
                    create: 'POST /api/content/admin/wiki/create',
                    update: 'PUT /api/content/admin/wiki/:id',
                    delete: 'DELETE /api/content/admin/wiki/:id',
                    list: 'GET /api/content/admin/wiki/list'
                }
            },
            meditation: {
                courses: 'GET /api/content/meditation/courses',
                courseDetail: 'GET /api/content/meditation/course/:id',
                record: 'POST /api/content/meditation/record',
                stats: 'GET /api/content/meditation/stats'
            },
            ritual: {
                list: 'GET /api/content/ritual/list',
                detail: 'GET /api/content/ritual/:id',
                progress: 'POST /api/content/ritual/progress',
                stats: 'GET /api/content/ritual/stats'
            }
        }
    });
});

module.exports = router;
