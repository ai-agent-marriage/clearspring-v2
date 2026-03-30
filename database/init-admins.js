# 管理员账号初始化脚本
# 执行方式：在微信云开发控制台 → 数据库 → 执行

// 1. 创建 admins 集合（如果不存在）
// 集合名称：admins

// 2. 添加默认管理员账号
db.collection('admins').add({
  data: {
    username: 'admin',
    password: 'admin123', // 生产环境请修改为强密码
    role: 'super_admin',
    status: 'active',
    permissions: [
      'order:read',
      'order:write',
      'order:delete',
      'qualification:read',
      'qualification:write',
      'appeal:read',
      'appeal:write',
      'executor:read',
      'executor:write',
      'profit:read',
      'profit:write',
      'export:read',
      'settings:read',
      'settings:write'
    ],
    createdAt: new Date(),
    lastLoginAt: null,
    createdBy: 'system'
  }
});

// 3. 添加运营管理员账号
db.collection('admins').add({
  data: {
    username: 'operator',
    password: 'operator123',
    role: 'operator',
    status: 'active',
    permissions: [
      'order:read',
      'order:write',
      'qualification:read',
      'qualification:write',
      'appeal:read',
      'appeal:write',
      'executor:read',
      'export:read'
    ],
    createdAt: new Date(),
    lastLoginAt: null,
    createdBy: 'system'
  }
});

// 4. 添加审核员账号
db.collection('admins').add({
  data: {
    username: 'auditor',
    password: 'auditor123',
    role: 'auditor',
    status: 'active',
    permissions: [
      'order:read',
      'qualification:read',
      'qualification:write',
      'appeal:read',
      'appeal:write',
      'executor:read'
    ],
    createdAt: new Date(),
    lastLoginAt: null,
    createdBy: 'system'
  }
});

console.log('管理员账号初始化完成！');
console.log('默认账号：');
console.log('  - 超级管理员：admin / admin123');
console.log('  - 运营管理员：operator / operator123');
console.log('  - 审核员：auditor / auditor123');
console.log('⚠️ 生产环境请立即修改默认密码！');
