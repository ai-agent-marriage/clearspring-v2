/**
 * 管理端 - 资质审核接口
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const { getDb } = require('../../server');
const { ObjectId } = require('mongodb');

/**
 * 管理员权限中间件
 */
const adminMiddleware = async (req, res, next) => {
  try {
    await authMiddleware(req, res, () => {});
    
    if (req.user.role !== 'admin') {
      throw new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/qualifications
 * 资质审核列表
 * 查询参数：page, pageSize, status, type, userId
 */
router.get('/qualifications', adminMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
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
      query.userId = ObjectId(userId);
    }
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // 查询资质列表
    const certificates = await db.collection('certificates')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 统计总数
    const total = await db.collection('certificates').countDocuments(query);
    
    // 获取用户信息（批量）
    const userIds = certificates
      .filter(c => c.userId)
      .map(c => c.userId);
    
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
      message: '获取成功',
      data: {
        qualifications: certificates.map(cert => ({
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
      }
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
router.put('/qualification/:id', adminMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
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
    const certificate = await db.collection('certificates').findOne({
      _id: ObjectId(qualificationId)
    });
    
    if (!certificate) {
      throw new AppError('资质记录不存在', 'CERTIFICATE_NOT_FOUND', 404);
    }
    
    // 检查是否已经审核过
    if (certificate.status !== 'pending') {
      throw new AppError('该资质已经审核过', 'CERTIFICATE_ALREADY_AUDITED', 400);
    }
    
    // 构建更新内容
    const updateData = {
      status,
      auditUserId: ObjectId(req.user.userId),
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
    await db.collection('certificates').updateOne(
      { _id: ObjectId(qualificationId) },
      { $set: updateData }
    );
    
    // 如果审核通过，更新用户的证书列表
    if (status === 'approved') {
      await db.collection('users').updateOne(
        { _id: certificate.userId },
        {
          $addToSet: {
            certificates: {
              type: certificate.type,
              certificateNo: certificate.certificateNo,
              certificateName: certificate.certificateName,
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
      certificateId: ObjectId(qualificationId),
      certificateUserId: certificate.userId,
      oldStatus: certificate.status,
      newStatus: status,
      rejectReason: rejectReason || '',
      auditRemark: auditRemark || '',
      timestamp: new Date()
    });
    
    res.json({
      code: 'SUCCESS',
      message: status === 'approved' ? '审核通过' : '已驳回',
      data: {
        qualificationId,
        status,
        auditTime: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
