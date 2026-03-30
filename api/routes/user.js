/**
 * 用户接口路由
 * @module routes/user
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { getDb } = require('../server');
const axios = require('axios');

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: 微信登录
 *     tags: [用户]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: 微信登录 code
 *               encryptedData:
 *                 type: string
 *                 description: 微信加密数据
 *               iv:
 *                 type: string
 *                 description: 微信加密向量
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: SUCCESS
 *                 message:
 *                   type: string
 *                   example: 登录成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT Token
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', async (req, res, next) => {
  try {
    const { code, encryptedData, iv } = req.body;
    
    if (!code) {
      throw new AppError('缺少微信登录 code', 'MISSING_CODE', 400);
    }
    
    // 调用微信接口获取 openid 和 session_key
    const appId = process.env.WECHAT_APPID || 'wxa914ecc15836bda6';
    const secret = process.env.WECHAT_SECRET;
    
    const loginRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: appId,
        secret: secret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });
    
    const { openid, session_key, errcode, errmsg } = loginRes.data;
    
    if (errcode) {
      throw new AppError(`微信登录失败：${errmsg}`, 'WECHAT_LOGIN_FAILED', 400);
    }
    
    const db = getDb();
    
    // 查找或创建用户
    let user = await db.collection('users').findOne({ openId: openid });
    
    if (!user) {
      // 创建新用户
      const newUser = {
        openId: openid,
        unionId: null,
        nickName: '新用户',
        avatarUrl: '',
        gender: 0,
        city: '',
        province: '',
        country: '',
        phone: '',
        role: 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('users').insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // 更新最后登录时间
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
      );
    }
    
    // 生成 JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        openId: user.openId,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({
      code: 'SUCCESS',
      message: '登录成功',
      data: {
        token,
        user: {
          userId: user._id.toString(),
          openId: user.openId,
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/user/profile
 * 获取用户信息
 */
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const userId = req.user.userId;
    
    const user = await db.collection('users').findOne(
      { _id: require('mongodb').ObjectId(userId) },
      { projection: { sessionKey: 0 } } // 不返回敏感信息
    );
    
    if (!user) {
      throw new AppError('用户不存在', 'USER_NOT_FOUND', 404);
    }
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        user: {
          userId: user._id.toString(),
          openId: user.openId,
          unionId: user.unionId,
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          gender: user.gender,
          city: user.city,
          province: user.province,
          country: user.country,
          phone: user.phone,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/user/profile
 * 更新用户信息
 */
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const userId = req.user.userId;
    
    const { nickName, avatarUrl, gender, phone, city, province, country } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (nickName !== undefined) updateData.nickName = nickName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (gender !== undefined) updateData.gender = gender;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (province !== undefined) updateData.province = province;
    if (country !== undefined) updateData.country = country;
    
    const result = await db.collection('users').findOneAndUpdate(
      { _id: require('mongodb').ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new AppError('用户不存在', 'USER_NOT_FOUND', 404);
    }
    
    res.json({
      code: 'SUCCESS',
      message: '更新成功',
      data: {
        user: {
          userId: result._id.toString(),
          openId: result.openId,
          nickName: result.nickName,
          avatarUrl: result.avatarUrl,
          gender: result.gender,
          phone: result.phone,
          city: result.city,
          province: result.province,
          country: result.country,
          role: result.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
