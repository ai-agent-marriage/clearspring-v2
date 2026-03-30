/**
 * 管理端 - 管理员认证接口
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const { getDb } = require('../../server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

/**
 * POST /api/admin/login
 * 管理员登录（账号密码登录）
 * Body: username, password
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      throw new AppError('用户名和密码不能为空', 'MISSING_CREDENTIALS', 400);
    }
    
    const db = getDb();
    
    // 查找管理员（支持 username 或 phone 登录）
    const admin = await db.collection('users').findOne({
      $or: [
        { username: username },
        { phone: username }
      ],
      role: 'admin',
      status: 'active'
    });
    
    if (!admin) {
      throw new AppError('用户名或密码错误', 'INVALID_CREDENTIALS', 401);
    }
    
    // 验证密码
    if (!admin.passwordHash) {
      // 如果是初始管理员且没有密码哈希，使用默认密码
      // 首次登录后应修改密码
      if (username === 'admin' && password === 'admin123') {
        // 允许初始登录
      } else {
        throw new AppError('用户名或密码错误', 'INVALID_CREDENTIALS', 401);
      }
    } else {
      const isValid = await bcrypt.compare(password, admin.passwordHash);
      if (!isValid) {
        throw new AppError('用户名或密码错误', 'INVALID_CREDENTIALS', 401);
      }
    }
    
    // 生成 JWT token（管理员 token 有效期更长）
    const token = jwt.sign(
      {
        userId: admin._id.toString(),
        openId: admin.openId,
        role: 'admin',
        username: admin.username
      },
      process.env.JWT_SECRET || 'clearspring_v2_secret_key_2026',
      { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '30d' }
    );
    
    // 更新最后登录时间
    await db.collection('users').updateOne(
      { _id: admin._id },
      { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
    );
    
    // 记录登录日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_login',
      userId: admin._id,
      username: admin.username,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      message: '登录成功',
      data: {
        token,
        admin: {
          adminId: admin._id.toString(),
          username: admin.username,
          nickName: admin.nickName,
          avatarUrl: admin.avatarUrl,
          phone: admin.phone,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions || ['all'],
          lastLoginAt: admin.lastLoginAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/profile
 * 获取管理员信息
 */
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const adminId = req.user.userId;
    
    // 验证是否为管理员
    if (req.user.role !== 'admin') {
      throw new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403);
    }
    
    const admin = await db.collection('users').findOne(
      { _id: ObjectId(adminId) },
      { projection: { passwordHash: 0, sessionKey: 0 } }
    );
    
    if (!admin) {
      throw new AppError('管理员不存在', 'ADMIN_NOT_FOUND', 404);
    }
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
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
          createdAt: admin.createdAt,
          lastLoginAt: admin.lastLoginAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/profile
 * 更新管理员信息
 */
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const adminId = req.user.userId;
    
    if (req.user.role !== 'admin') {
      throw new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403);
    }
    
    const { nickName, avatarUrl, phone, email } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (nickName !== undefined) updateData.nickName = nickName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    
    const result = await db.collection('users').findOneAndUpdate(
      { _id: ObjectId(adminId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new AppError('管理员不存在', 'ADMIN_NOT_FOUND', 404);
    }
    
    res.json({
      code: 'SUCCESS',
      message: '更新成功',
      data: {
        admin: {
          adminId: result._id.toString(),
          username: result.username,
          nickName: result.nickName,
          avatarUrl: result.avatarUrl,
          phone: result.phone,
          email: result.email,
          role: result.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/password
 * 修改管理员密码
 */
router.put('/password', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const adminId = req.user.userId;
    
    if (req.user.role !== 'admin') {
      throw new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403);
    }
    
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      throw new AppError('旧密码和新密码不能为空', 'MISSING_PASSWORD', 400);
    }
    
    if (newPassword.length < 6) {
      throw new AppError('新密码长度不能少于 6 位', 'PASSWORD_TOO_SHORT', 400);
    }
    
    const admin = await db.collection('users').findOne({
      _id: ObjectId(adminId)
    });
    
    if (!admin) {
      throw new AppError('管理员不存在', 'ADMIN_NOT_FOUND', 404);
    }
    
    // 验证旧密码
    if (admin.passwordHash) {
      const isValid = await bcrypt.compare(oldPassword, admin.passwordHash);
      if (!isValid) {
        throw new AppError('旧密码错误', 'INVALID_OLD_PASSWORD', 400);
      }
    } else {
      // 如果是初始管理员，验证默认密码
      if (oldPassword !== 'admin123') {
        throw new AppError('旧密码错误', 'INVALID_OLD_PASSWORD', 400);
      }
    }
    
    // 加密新密码
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await db.collection('users').updateOne(
      { _id: ObjectId(adminId) },
      { 
        $set: { 
          passwordHash,
          passwordChangedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    // 记录密码修改日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_password_change',
      userId: ObjectId(adminId),
      username: admin.username,
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      message: '密码修改成功',
      data: {
        passwordChangedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/logout
 * 管理员登出
 */
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    // 记录登出日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_logout',
      userId: ObjectId(req.user.userId),
      username: req.user.username,
      ip: req.ip || req.headers['x-forwarded-for'],
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      message: '登出成功'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
