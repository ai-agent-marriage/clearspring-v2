#!/usr/bin/env node

/**
 * 清如 ClearSpring V2 - API 路由验证脚本
 * 验证 5 个缺失 API 是否正确注册
 */

const fs = require('fs');
const logger = require('../../utils/logger');

const path = require('path');

logger.info('╔════════════════════════════════════════════════════╗');
logger.info('║   清如 ClearSpring V2 - API 路由验证                ║');
logger.info('╚════════════════════════════════════════════════════╝\n');

const adminIndexPath = path.join(__dirname, '../api/routes/admin/index.js');
const indexContent = fs.readFileSync(adminIndexPath, 'utf-8');

const requiredRoutes = [
  {
    name: 'Dashboard Stats API',
    path: '/api/admin/dashboard/stats',
    file: 'dashboard.js',
    check: "require('./dashboard')"
  },
  {
    name: 'Orders Export API',
    path: '/api/admin/orders/export',
    file: 'export.js',
    check: "require('./export')"
  },
  {
    name: 'Profit Sharing Update API',
    path: '/api/admin/profit-sharing',
    file: 'profit-sharing.js',
    check: "require('./profit-sharing')"
  },
  {
    name: 'Export History API',
    path: '/api/admin/export/history',
    file: 'export.js',
    check: "require('./export')"
  },
  {
    name: 'Settings Update API',
    path: '/api/admin/settings',
    file: 'settings.js',
    check: "require('./settings')"
  }
];

let allPassed = true;

logger.info('📋 检查路由注册情况:\n');

requiredRoutes.forEach((route, index) => {
  const isRegistered = indexContent.includes(route.check);
  const status = isRegistered ? '✅' : '❌';
  logger.info(`${status} ${index + 1}. ${route.name}`);
  logger.info(`   路径：${route.path}`);
  logger.info(`   文件：${route.file}`);
  logger.info(`   注册：${isRegistered ? '已注册' : '未注册'}\n`);
  
  if (!isRegistered) {
    allPassed = false;
  }
});

logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 检查路由文件是否存在
logger.info('📁 检查路由文件:\n');

const routeFiles = [
  'dashboard.js',
  'export.js',
  'profit-sharing.js',
  'settings.js'
];

const adminRoutesDir = path.join(__dirname, '../api/routes/admin');

routeFiles.forEach(file => {
  const filePath = path.join(adminRoutesDir, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  logger.info(`${status} ${file}: ${exists ? '存在' : '不存在'}`);
  
  if (!exists) {
    allPassed = false;
  }
});

logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 检查路由文件中的具体路由定义
logger.info('🔍 检查路由定义:\n');

const routeDefinitions = [
  {
    file: 'dashboard.js',
    pattern: /router\.get\(['"]\/stats['"]/,
    description: 'GET /stats'
  },
  {
    file: 'export.js',
    pattern: /router\.get\(['"]\/orders\/export['"]/,
    description: 'GET /orders/export'
  },
  {
    file: 'export.js',
    pattern: /router\.get\(['"]\/history['"]/,
    description: 'GET /history'
  },
  {
    file: 'profit-sharing.js',
    pattern: /router\.put\(['"]\/['"]/,
    description: 'PUT /'
  },
  {
    file: 'settings.js',
    pattern: /router\.post\(['"]\/['"]/,
    description: 'POST /'
  }
];

routeDefinitions.forEach((route, index) => {
  const filePath = path.join(adminRoutesDir, route.file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const isDefined = route.pattern.test(content);
  const status = isDefined ? '✅' : '❌';
  logger.info(`${status} ${route.file}: ${route.description} - ${isDefined ? '已定义' : '未定义'}`);
  
  if (!isDefined) {
    allPassed = false;
  }
});

logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 检查文档
logger.info('📄 检查文档:\n');

const docs = [
  '../docs/admin-apis.md',
  '../docs/IMPLEMENTATION_REPORT.md'
];

docs.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  const exists = fs.existsSync(docPath);
  const status = exists ? '✅' : '❌';
  logger.info(`${status} ${path.basename(doc)}: ${exists ? '已生成' : '未生成'}`);
  
  if (!exists) {
    allPassed = false;
  }
});

logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 总结
if (allPassed) {
  logger.info('✅ 所有检查通过！5 个 API 接口已全部实现并正确注册。\n');
  logger.info('下一步:');
  logger.info('1. 启动服务器: npm start');
  logger.info('2. 设置 Token: export ADMIN_TOKEN="your_token"');
  logger.info('3. 运行测试: node tests/missing-api.test.js\n');
  process.exit(0);
} else {
  logger.info('❌ 部分检查未通过，请检查上述输出。\n');
  process.exit(1);
}
