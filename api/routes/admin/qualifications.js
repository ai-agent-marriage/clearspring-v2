/**
 * 管理端 - 资质审核接口
 */

const express = require('express');

const { validate, auditQualificationSchema, idParamSchema, qualificationListQuerySchema } = require('../../validators/admin.validator');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const server = require('../../server');
const { ObjectId } = require('mongodb');



/**
 * 管理员权限中间件
 */
const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    // 检查是否为管理员
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return next(new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403));
    }
    
    next();
  });
};

/**
 * GET /api/admin/qualifications
 * 资质审核列表
 * 查询参数：page, pageSize, status, type, userId
 */
router.get('/', adminMiddleware, validate(qualificationListQuerySchema, 'query'), async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const {
      page = 1,
      pageSize = 20,
      status,
      type,
      userId
    } = req.query;
    
    // 构建查询条件
    const query = {};
    
    if (status) {
      query.status = status; // pending, approved, rejected
    }
    
    if (type) {
      query.type = type;
    }
    
    if (userId) {
      query.userId = new ObjectId(userId);
    }
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // 查询资质列表
    const qualifications = await db.collection('qualifications')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 统计总数
    const total = await db.collection('qualifications').countDocuments(query);
    
    // 获取用户信息（批量）
    const userIds = qualifications
      .filter(q => q.userId)
      .map(q => q.userId);
    
    const users = await db.collection('users')
      .find({ _id: { $in: userIds } })
      .project({ _id: 1, nickName: 1, phone: 1, avatarUrl: 1 })
      .toArray();
    
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        qualifications: qualifications.map(cert => ({
          qualificationId: cert._id.toString(),
          userId: cert.userId?.toString(),
          user: userMap[cert.userId?.toString()] ? {
            userId: cert.userId.toString(),
            nickName: userMap[cert.userId.toString()].nickName,
            phone: userMap[cert.userId.toString()].phone,
            avatarUrl: userMap[cert.userId.toString()].avatarUrl
          } : null,
          type: cert.type,
          certificateNo: cert.certificateNo,
          certificateName: cert.certificateName,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          images: cert.images || [],
          status: cert.status, // pending, approved, rejected
          rejectReason: cert.rejectReason || '',
          auditUserId: cert.auditUserId?.toString(),
          auditTime: cert.auditTime,
          createdAt: cert.createdAt,
          updatedAt: cert.updatedAt
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
 * PUT /api/admin/qualification/:id
 * 审核通过/驳回
 * Body: status (approved/rejected), rejectReason (驳回时必填), auditRemark
 */
router.put('/:id', adminMiddleware, validate(auditQualificationSchema, 'body'), async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const qualificationId = req.params.id;
    const { status, rejectReason, auditRemark } = req.body;
    
    // 验证状态
    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('无效的状态，只能是 approved 或 rejected', 'INVALID_STATUS', 400);
    }
    
    // 驳回时必须填写原因
    if (status === 'rejected' && !rejectReason) {
      throw new AppError('驳回时必须填写原因', 'MISSING_REJECT_REASON', 400);
    }
    
    // 检查资质是否存在
    const qualification = await db.collection('qualifications').findOne({
      _id: new ObjectId(qualificationId)
    });
    
    if (!qualification) {
      throw new AppError('资质记录不存在', 'CERTIFICATE_NOT_FOUND', 404);
    }
    
    // 检查是否已经审核过
    if (qualification.status !== 'pending') {
      throw new AppError('该资质已经审核过', 'QUALIFICATION_ALREADY_AUDITED', 400);
    }
    
    // 构建更新内容
    const updateData = {
      status,
      auditUserId: new ObjectId(req.user.userId),
      auditTime: new Date(),
      updatedAt: new Date()
    };
    
    if (status === 'rejected') {
      updateData.rejectReason = rejectReason;
    }
    
    if (auditRemark) {
      updateData.auditRemark = auditRemark;
    }
    
    // 更新资质状态
    await db.collection('qualifications').updateOne(
      { _id: new ObjectId(qualificationId) },
      { $set: updateData }
    );
    
    // 如果审核通过，更新用户的资质列表
    if (status === 'approved') {
      await db.collection('users').updateOne(
        { _id: qualification.userId },
        {
          $addToSet: {
            qualifications: {
              type: qualification.type,
              certificateNo: qualification.certificateNo,
              certificateName: qualification.certificateName,
              verifiedAt: new Date()
            }
          }
        }
      );
    }
    
    // 记录审计日志
    await db.collection('audit_logs').insertOne({
      type: 'admin_qualification_audit',
      userId: req.user.userId,
      qualificationId: new ObjectId(qualificationId),
      qualificationUserId: qualification.userId,
      oldStatus: qualification.status,
      newStatus: status,
      rejectReason: rejectReason || '',
      auditRemark: auditRemark || '',
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      data: {
        qualificationId,
        status,
        auditTime: new Date()
      },
      message: status === 'approved' ? '审核通过' : '已驳回'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
