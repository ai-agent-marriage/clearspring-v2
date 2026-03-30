# 管理员账号初始化脚本
# 执行方式：在微信云开发控制台 → 数据库 → 执行
# 密码已使用 bcrypt 加密（salt rounds = 10）

// 1. 创建 admins 集合（如果不存在）
// 集合名称：admins

// 2. 添加默认管理员账号
// 密码：admin123 (已加密)
db.collection('admins').add({
  data: {
    username: 'admin',
    passwordHash: '$2a$10$vezVXN68I3PcEpNo3B09Q.9goZJk8Tb7.U2Ms5PgtnHIltsAGFgiy',
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
// 密码：operator123 (已加密)
db.collection('admins').add({
  data: {
    username: 'operator',
    passwordHash: '$2a$10$f8ud07UMY7Ccns3KM17.9uLceh./H1isZ04d6KQL6ESL8brGdK/.m',
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
// 密码：auditor123 (已加密)
db.collection('admins').add({
  data: {
    username: 'auditor',
    passwordHash: '$2a$10$3a94a1iODy1JWb3IKjZ7p.3hO94HAlh2JFB9G0k4segjtCKynmpQm',
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

logger.info('管理员账号初始化完成！');
logger.info('默认账号（密码已加密存储）：');
logger.info('  - 超级管理员：admin / admin123');
logger.info('  - 运营管理员：operator / operator123');
logger.info('  - 审核员：auditor / auditor123');
logger.info('⚠️ 生产环境请立即修改默认密码！');
logger.info('🔒 密码已使用 bcrypt 加密存储');
