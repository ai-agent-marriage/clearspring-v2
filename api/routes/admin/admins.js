/**
 * 管理端 - 管理员信息管理接口
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const server = require('../../server');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');



/**
 * 超级管理员权限中间件
 */
const superAdminMiddleware = (req, res, next) => {
  authMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return next(new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403));
    }
    
    const db = req.app.get('db');
    db.collection('users').findOne({
      _id: new ObjectId(req.user.userId)
    }).then(admin => {
      // 检查是否为超级管理员（permissions 包含 'all' 或 'manage_admins'）
      if (!admin || !(admin.permissions?.includes('all') || admin.permissions?.includes('manage_admins'))) {
        return next(new AppError('权限不足，需要超级管理员权限', 'FORBIDDEN', 403));
      }
      
      next();
    }).catch(next);
  });
};

/**
 * GET /api/admin/admins
 * 管理员列表
 * 查询参数：page, pageSize, status, keyword
 */
router.get('/', superAdminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const {
      page = 1,
      pageSize = 20,
      status,
      keyword
    } = req.query;
    
    // 构建查询条件
    const query = { role: 'admin' };
    
    if (status) {
      query.status = status; // active, inactive
    }
    
    // 关键词搜索
    if (keyword) {
      const keywordRegex = new RegExp(keyword, 'i');
      query.$or = [
        { username: keywordRegex },
        { nickName: keywordRegex },
        { phone: keywordRegex },
        { email: keywordRegex }
      ];
    }
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // 查询管理员列表
    const admins = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 统计总数
    const total = await db.collection('users').countDocuments(query);
    
    res.json({
      code: 'SUCCESS',
      data: {
        admins: admins.map(admin => ({
          adminId: admin._id.toString(),
          username: admin.username,
          nickName: admin.nickName,
          avatarUrl: admin.avatarUrl,
          phone: admin.phone,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions || ['all'],
          status: admin.status,
          lastLoginAt: admin.lastLoginAt,
          createdAt: admin.createdAt,
          passwordChangedAt: admin.passwordChangedAt
        })),
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      },
      message: '获取成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/admin/:id
 * 管理员详情
 */
router.get('/admin/:id', superAdminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const adminId = req.params.id;
    
    const admin = await db.collection('users').findOne(
      { _id: new ObjectId(adminId), role: 'admin' },
      { projection: { passwordHash: 0, sessionKey: 0 } }
    );
    
    if (!admin) {
      throw new AppError('管理员不存在', 'ADMIN_NOT_FOUND', 404);
    }
    
    res.json({
      code: 'SUCCESS',
      data: {
        admin: {
          adminId: admin._id.toString(),
          username: admin.username,
          nickName: admin.nickName,
          avatarUrl: admin.avatarUrl,
          phone: admin.phone,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions || ['all'],
          status: admin.status,
          lastLoginAt: admin.lastLoginAt,
          createdAt: admin.createdAt
        }
      },
      message: '获取成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/admin
 * 创建管理员
 * Body: username, password, nickName, phone, email, permissions
 */
router.post('/admin', superAdminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { username, password, nickName, phone, email, permissions } = req.body;
    
    // 验证必填字段
    if (!username || !password) {
      throw new AppError('用户名和密码不能为空', 'MISSING_CREDENTIALS', 400);
    }
    
    if (password.length < 6) {
      throw new AppError('密码长度不能少于 6 位', 'PASSWORD_TOO_SHORT', 400);
    }
    
    // 检查用户名是否已存在
    const existingAdmin = await db.collection('users').findOne({
      username: username,
      role: 'admin'
    });
    
    if (existingAdmin) {
      throw new AppError('用户名已存在', 'USERNAME_EXISTS', 400);
    }
    
    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 创建管理员
    const newAdmin = {
      username,
      passwordHash,
      nickName: nickName || username,
      phone: phone || '',
      email: email || '',
      role: 'admin',
      status: 'active',
      permissions: permissions || ['view_orders', 'view_executors'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(newAdmin);
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_create',
      userId: new ObjectId(req.user.userId),
      targetAdminId: result.insertedId,
      targetUsername: username,
      permissions: newAdmin.permissions,
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        adminId: result.insertedId.toString(),
        username,
        nickName: newAdmin.nickName,
        permissions: newAdmin.permissions,
        createdAt: newAdmin.createdAt
      },
      message: '管理员创建成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/admin/:id
 * 更新管理员信息
 * Body: nickName, phone, email, permissions, status
 */
router.put('/admin/:id', superAdminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const adminId = req.params.id;
    const { nickName, phone, email, permissions, status } = req.body;
    
    // 不能修改自己的权限和状态
    if (adminId === req.user.userId && (permissions || status)) {
      throw new AppError('不能修改自己的权限和状态', 'CANNOT_MODIFY_SELF', 400);
    }
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (nickName !== undefined) updateData.nickName = nickName;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (status !== undefined) updateData.status = status;
    
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(adminId), role: 'admin' },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new AppError('管理员不存在', 'ADMIN_NOT_FOUND', 404);
    }
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_update',
      userId: new ObjectId(req.user.userId),
      targetAdminId: new ObjectId(adminId),
      targetUsername: result.username,
      changes: updateData,
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        adminId: result._id.toString(),
        username: result.username,
        nickName: result.nickName,
        permissions: result.permissions,
        status: result.status,
        updatedAt: new Date()
      },
      message: '管理员信息已更新'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/admin/:id
 * 删除管理员
 */
router.delete('/admin/:id', superAdminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const adminId = req.params.id;
    
    // 不能删除自己
    if (adminId === req.user.userId) {
      throw new AppError('不能删除自己的账号', 'CANNOT_DELETE_SELF', 400);
    }
    
    const admin = await db.collection('users').findOne({
      _id: new ObjectId(adminId),
      role: 'admin'
    });
    
    if (!admin) {
      throw new AppError('管理员不存在', 'ADMIN_NOT_FOUND', 404);
    }
    
    // 软删除：将状态设为 inactive
    await db.collection('users').updateOne(
      { _id: new ObjectId(adminId) },
      { 
        $set: { 
          status: 'inactive',
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_delete',
      userId: new ObjectId(req.user.userId),
      targetAdminId: new ObjectId(adminId),
      targetUsername: admin.username,
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        adminId,
        username: admin.username,
        deletedAt: new Date()
      },
      message: '管理员已删除'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/admin/:id/reset-password
 * 重置管理员密码
 */
router.put('/admin/:id/reset-password', superAdminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const adminId = req.params.id;
    const { newPassword } = req.body;
    
    // 不能重置自己的密码（应使用修改密码接口）
    if (adminId === req.user.userId) {
      throw new AppError('请使用修改密码接口修改自己的密码', 'CANNOT_RESET_SELF', 400);
    }
    
    if (!newPassword || newPassword.length < 6) {
      throw new AppError('新密码长度不能少于 6 位', 'PASSWORD_TOO_SHORT', 400);
    }
    
    const admin = await db.collection('users').findOne({
      _id: new ObjectId(adminId),
      role: 'admin'
    });
    
    if (!admin) {
      throw new AppError('管理员不存在', 'ADMIN_NOT_FOUND', 404);
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(adminId) },
      { 
        $set: { 
          passwordHash,
          passwordChangedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_password_reset',
      userId: new ObjectId(req.user.userId),
      targetAdminId: new ObjectId(adminId),
      targetUsername: admin.username,
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        adminId,
        passwordChangedAt: new Date()
      },
      message: '密码已重置'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
