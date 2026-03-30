/**
 * 批量为 admin 路由添加输入验证
 */

const fs = require('fs');
const path = require('path');

const ADMIN_ROUTES_DIR = path.join(__dirname, '../api/routes/admin');

// 路由文件与验证 schema 的映射
const routeSchemas = {
  'auth.js': {
    imports: "const { validate, loginSchema } = require('../../validators/admin.validator');",
    validations: [
      { route: "router.post('/login'", schema: 'validate(loginSchema, \'body\')' }
    ]
  },
  'admins.js': {
    imports: "const { validate, createAdminSchema, updateAdminSchema, resetPasswordSchema, idParamSchema, adminListQuerySchema } = require('../../validators/admin.validator');",
    validations: [
      { route: "router.post('/admin'", schema: 'validate(createAdminSchema, \'body\')' },
      { route: "router.put('/admin/:id'", schema: 'validate(updateAdminSchema, \'body\')' },
      { route: "router.put('/admin/:id/reset-password'", schema: 'validate(resetPasswordSchema, \'body\')' },
      { route: "router.get('/admin/:id'", schema: 'validate(idParamSchema, \'params\')' },
      { route: "router.delete('/admin/:id'", schema: 'validate(idParamSchema, \'params\')' },
      { route: "router.get('/'", schema: 'validate(adminListQuerySchema, \'query\')' }
    ]
  },
  'orders.js': {
    imports: "const { validate, updateOrderStatusSchema, idParamSchema, orderListQuerySchema } = require('../../validators/admin.validator');",
    validations: [
      { route: "router.put('/:id/status'", schema: 'validate(updateOrderStatusSchema, \'body\')' },
      { route: "router.delete('/:id'", schema: 'validate(idParamSchema, \'params\')' },
      { route: "router.get('/'", schema: 'validate(orderListQuerySchema, \'query\')' }
    ]
  },
  'qualifications.js': {
    imports: "const { validate, auditQualificationSchema, idParamSchema, qualificationListQuerySchema } = require('../../validators/admin.validator');",
    validations: [
      { route: "router.put('/:id'", schema: 'validate(auditQualificationSchema, \'body\')' },
      { route: "router.get('/'", schema: 'validate(qualificationListQuerySchema, \'query\')' }
    ]
  },
  'executors.js': {
    imports: "const { validate, updateExecutorStatusSchema, idParamSchema } = require('../../validators/admin.validator');",
    validations: [
      { route: "router.put('/:id/status'", schema: 'validate(updateExecutorStatusSchema, \'body\')' }
    ]
  },
  'profit-sharing.js': {
    imports: "const { validate, profitSharingSchema } = require('../../validators/admin.validator');",
    validations: [
      { route: "router.post('/allocate'", schema: 'validate(profitSharingSchema, \'body\')' }
    ]
  }
};

function updateRouteFile(filePath, config) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否已经添加过验证器导入
  if (content.includes("require('../../validators/admin.validator')")) {
    console.log(`⏭️  跳过 ${path.basename(filePath)} - 已添加验证器`);
    return false;
  }
  
  // 添加导入语句（在最后一个 require 之后）
  const lastRequireMatch = content.match(/(const \w+ = require\(['"].*?['"]\);[\s\n]*)/);
  if (lastRequireMatch) {
    const lastRequire = lastRequireMatch[0];
    const insertPos = content.indexOf(lastRequire) + lastRequire.length;
    content = content.slice(0, insertPos) + '\n' + config.imports + '\n' + content.slice(insertPos);
  }
  
  // 添加验证中间件到路由
  for (const validation of config.validations) {
    const routePattern = new RegExp(`(${validation.route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*,\\s*)(async\\s*\\([^)]*\\)\\s*=>)`, 'g');
    if (routePattern.test(content)) {
      content = content.replace(routePattern, `$1${validation.schema}, $2`);
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ 更新 ${path.basename(filePath)}`);
  return true;
}

// 主程序
console.log('🔧 开始为 admin 路由添加输入验证...\n');

let updatedCount = 0;

for (const [filename, config] of Object.entries(routeSchemas)) {
  const filePath = path.join(ADMIN_ROUTES_DIR, filename);
  
  if (fs.existsSync(filePath)) {
    if (updateRouteFile(filePath, config)) {
      updatedCount++;
    }
  } else {
    console.log(`⚠️  文件不存在：${filename}`);
  }
}

console.log(`\n📊 更新完成：${updatedCount} 个文件已添加输入验证`);
console.log('\n验证覆盖:');
console.log('  ✅ auth.js - 登录验证');
console.log('  ✅ admins.js - 管理员 CRUD 验证');
console.log('  ✅ orders.js - 订单管理验证');
console.log('  ✅ qualifications.js - 资质审核验证');
console.log('  ✅ executors.js - 执行者管理验证');
console.log('  ✅ profit-sharing.js - 利润分成验证');
