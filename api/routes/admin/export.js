/**
 * 管理端 - 数据导出接口
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const server = require('../../server');
const { ObjectId } = require('mongodb');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');



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

// 确保导出目录存在
const exportDir = path.join(__dirname, '../../../exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

/**
 * GET /api/admin/export/orders
 * 导出订单数据
 */
router.get('/export/orders', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const {
      startDate,
      endDate,
      status,
      serviceType,
      format = 'xlsx'
    } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(10000)
      .toArray();
    
    const userIds = [...new Set(orders.filter(o => o.userId).map(o => o.userId.toString()))];
    const executorIds = [...new Set(orders.filter(o => o.executorId).map(o => o.executorId.toString()))];
    
    const users = await db.collection('users')
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .project({ _id: 1, nickName: 1, phone: 1 })
      .toArray();
    
    const executors = await db.collection('users')
      .find({ _id: { $in: executorIds.map(id => new ObjectId(id)) } })
      .project({ _id: 1, nickName: 1, phone: 1 })
      .toArray();
    
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });
    
    const executorMap = {};
    executors.forEach(e => { executorMap[e._id.toString()] = e; });
    
    const data = orders.map(order => ({
      orderNo: order.orderNo,
      serviceType: order.serviceType,
      serviceName: order.serviceName,
      serviceDate: order.serviceDate ? new Date(order.serviceDate).toLocaleDateString('zh-CN') : '',
      location: order.location,
      price: order.price,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      status: getOrderStatusName(order.status),
      paymentStatus: getPaymentStatusName(order.paymentStatus),
      userNickName: userMap[order.userId?.toString()]?.nickName || '',
      userPhone: userMap[order.userId?.toString()]?.phone || '',
      executorNickName: executorMap[order.executorId?.toString()]?.nickName || '',
      executorPhone: executorMap[order.executorId?.toString()]?.phone || '',
      grabTime: order.grabTime ? new Date(order.grabTime).toLocaleString('zh-CN') : '',
      paidAt: order.paidAt ? new Date(order.paidAt).toLocaleString('zh-CN') : '',
      completedAt: order.completedAt ? new Date(order.completedAt).toLocaleString('zh-CN') : '',
      cancelledAt: order.cancelledAt ? new Date(order.cancelledAt).toLocaleString('zh-CN') : '',
      createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString('zh-CN') : '',
      remark: order.remark || ''
    }));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `orders_${timestamp}`;
    
    if (format === 'csv') {
      const csv = generateCSV(data);
      const filepath = path.join(exportDir, `${filename}.csv`);
      fs.writeFileSync(filepath, csv, 'utf-8');
      
      await logExport(req.user.userId, 'orders', data.length, format);
      
      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      const filepath = path.join(exportDir, `${filename}.xlsx`);
      await generateExcel(data, filepath, 'Orders');
      
      await logExport(req.user.userId, 'orders', data.length, format);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.sendFile(filepath, (err) => {
        if (!err) setTimeout(() => fs.unlinkSync(filepath), 60000);
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/export/executors
 * 导出执行者数据
 */
router.get('/export/executors', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { status, format = 'xlsx' } = req.query;
    
    const query = { role: 'executor' };
    if (status) query.status = status;
    
    const executors = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    const executorIds = executors.map(e => e._id);
    const orderStats = await db.collection('orders').aggregate([
      { $match: { executorId: { $in: executorIds } } },
      {
        $group: {
          _id: '$executorId',
          totalOrders: { $sum: 1 },
          completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalAmount: { $sum: '$totalPrice' }
        }
      }
    ]).toArray();
    
    const statsMap = {};
    orderStats.forEach(stat => { statsMap[stat._id.toString()] = stat; });
    
    const data = executors.map(executor => {
      const stats = statsMap[executor._id.toString()] || { totalOrders: 0, completedOrders: 0, totalAmount: 0 };
      return {
        executorId: executor._id.toString(),
        nickName: executor.nickName,
        phone: executor.phone,
        gender: executor.gender === 1 ? 'Male' : executor.gender === 2 ? 'Female' : 'Unknown',
        city: executor.city,
        province: executor.province,
        status: getExecutorStatusName(executor.status),
        rating: executor.rating || 0,
        serviceTypes: (executor.serviceTypes || []).join(','),
        serviceAreas: (executor.serviceAreas || []).join(','),
        totalOrders: stats.totalOrders,
        completedOrders: stats.completedOrders,
        completionRate: stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(2) + '%' : '0%',
        totalAmount: stats.totalAmount,
        createdAt: executor.createdAt ? new Date(executor.createdAt).toLocaleString('zh-CN') : '',
        lastLoginAt: executor.lastLoginAt ? new Date(executor.lastLoginAt).toLocaleString('zh-CN') : ''
      };
    });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `executors_${timestamp}`;
    
    if (format === 'csv') {
      const csv = generateCSV(data);
      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      const filepath = path.join(exportDir, `${filename}.xlsx`);
      await generateExcel(data, filepath, 'Executors');
      
      await logExport(req.user.userId, 'executors', data.length, format);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.sendFile(filepath, (err) => {
        if (!err) setTimeout(() => fs.unlinkSync(filepath), 60000);
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/export/users
 * 导出用户数据
 */
router.get('/export/users', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { format = 'xlsx' } = req.query;
    
    const users = await db.collection('users')
      .find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(10000)
      .toArray();
    
    const data = users.map(user => ({
      userId: user._id.toString(),
      nickName: user.nickName,
      phone: user.phone,
      gender: user.gender === 1 ? 'Male' : user.gender === 2 ? 'Female' : 'Unknown',
      city: user.city,
      province: user.province,
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN') : '',
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-CN') : ''
    }));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `users_${timestamp}`;
    
    if (format === 'csv') {
      const csv = generateCSV(data);
      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      const filepath = path.join(exportDir, `${filename}.xlsx`);
      await generateExcel(data, filepath, 'Users');
      
      await logExport(req.user.userId, 'users', data.length, format);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.sendFile(filepath, (err) => {
        if (!err) setTimeout(() => fs.unlinkSync(filepath), 60000);
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/export/qualifications
 * 导出资质审核数据
 */
router.get('/export/qualifications', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { status, format = 'xlsx' } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const certificates = await db.collection('certificates')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(10000)
      .toArray();
    
    const userIds = certificates.filter(c => c.userId).map(c => c.userId.toString());
    const users = await db.collection('users')
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .project({ _id: 1, nickName: 1, phone: 1 })
      .toArray();
    
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });
    
    const data = certificates.map(cert => ({
      qualificationId: cert._id.toString(),
      userNickName: userMap[cert.userId?.toString()]?.nickName || '',
      userPhone: userMap[cert.userId?.toString()]?.phone || '',
      type: cert.type,
      certificateNo: cert.certificateNo,
      certificateName: cert.certificateName,
      issueDate: cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('zh-CN') : '',
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('zh-CN') : '',
      status: getQualificationStatusName(cert.status),
      rejectReason: cert.rejectReason || '',
      auditTime: cert.auditTime ? new Date(cert.auditTime).toLocaleString('zh-CN') : '',
      createdAt: cert.createdAt ? new Date(cert.createdAt).toLocaleString('zh-CN') : ''
    }));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `qualifications_${timestamp}`;
    
    if (format === 'csv') {
      const csv = generateCSV(data);
      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      const filepath = path.join(exportDir, `${filename}.xlsx`);
      await generateExcel(data, filepath, 'Qualifications');
      
      await logExport(req.user.userId, 'qualifications', data.length, format);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.sendFile(filepath, (err) => {
        if (!err) setTimeout(() => fs.unlinkSync(filepath), 60000);
      });
    }
  } catch (error) {
    next(error);
  }
});

// 工具函数
function generateCSV(data) {
  if (data.length === 0) return '';
  const fields = Object.keys(data[0]);
  const parser = new Parser({ fields });
  return parser.parse(data);
}

async function generateExcel(data, filepath, sheetName) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ClearSpring Admin';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet(sheetName);
  
  if (data.length === 0) {
    await workbook.xlsx.writeFile(filepath);
    return;
  }
  
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);
  
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  data.forEach(item => {
    worksheet.addRow(headers.map(h => item[h]));
  });
  
  worksheet.columns.forEach(column => { column.width = 20; });
  
  await workbook.xlsx.writeFile(filepath);
}

async function logExport(userId, dataType, recordCount, format) {
  try {
    const db = req.app.get('db');
    await db.collection('audit_logs').insertOne({
      type: 'admin_data_export',
      userId: new ObjectId(userId),
      dataType,
      recordCount,
      format,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('记录导出日志失败:', error);
  }
}

function getOrderStatusName(status) {
  const map = { 'pending': '待支付', 'paid': '已支付', 'grabbed': '已接单', 'completed': '已完成', 'cancelled': '已取消' };
  return map[status] || status;
}

function getPaymentStatusName(status) {
  const map = { 'unpaid': '未支付', 'paid': '已支付', 'refunded': '已退款' };
  return map[status] || status;
}

function getExecutorStatusName(status) {
  const map = { 'active': '活跃', 'inactive': '未激活', 'banned': '已禁用' };
  return map[status] || status;
}

function getQualificationStatusName(status) {
  const map = { 'pending': '待审核', 'approved': '已通过', 'rejected': '已驳回' };
  return map[status] || status;
}

module.exports = router;
