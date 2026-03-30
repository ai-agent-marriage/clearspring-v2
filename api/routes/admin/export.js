/**
 * 管理端 - 数据导出接口
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const { getDb } = require('../../server');
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
 * 查询参数：startDate, endDate, status, serviceType, format (csv/xlsx)
 */
router.get('/export/orders', adminMiddleware, async (req, res, next) => {
  try {
    const db = getDb();
    const {
      startDate,
      endDate,
      status,
      serviceType,
      format = 'xlsx'
    } = req.query;
    
    // 构建查询条件
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (serviceType) {
      query.serviceType = serviceType;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // 查询订单数据
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(10000) // 限制最大导出量
      .toArray();
    
    // 获取用户和执行者信息
    const userIds = [...new Set(orders.filter(o => o.userId).map(o => o.userId.toString()))];
    const executorIds = [...new Set(orders.filter(o => o.executorId).map(o => o.executorId.toString()))];
    
    const users = await db.collection('users')
      .find({ _id: { $in: userIds.map(id => ObjectId(id)) } })
      .project({ _id: 1, nickName: 1, phone: 1 })
      .toArray();
    
    const executors = await db.collection('users')
      .find({ _id: { $in: executorIds.map(id => ObjectId(id)) } })
      .project({ _id: 1, nickName: 1, phone: 1 })
      .toArray();
    
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });
    
    const executorMap = {};
    executors.forEach(e => { executorMap[e._id.toString()] = e; });
    
    // 格式化数据
    const data = orders.map(order => ({
      订单号: order.orderNo,
      服务类型: order.serviceType,
      服务名称: order.serviceName,
      服务日期: order.serviceDate ? new Date(order.serviceDate).toLocaleDateString('zh-CN') : '',
      服务地点: order.location,
      单价: order.price,
      数量: order.quantity,
      总金额: order.totalPrice,
      状态: getOrderStatusName(order.status),
      支付状态: getPaymentStatusName(order.paymentStatus),
      用户: userMap[order.userId?.toString()]?.nickName || '',
      用户手机: userMap[order.userId?.toString()]?.phone || '',
      执行者: executorMap[order.executorId?.toString()]?.nickName || '',
      执行者手机: executorMap[order.executorId?.toString()]?.phone || '',
      抢单时间: order.grabTime ? new Date(order.grabTime).toLocaleString('zh-CN') : '',
      支付时间: order.paidAt ? new Date(order.paidAt).toLocaleString('zh-CN') : '',
      完成时间: order.completedAt ? new Date(order.completedAt).toLocaleString('zh-CN') : '',
      取消时间: order.cancelledAt ? new Date(order.cancelledAt).toLocaleString('zh-CN') : '',
      创建时间: order.createdAt ? new Date(order.createdAt).toLocaleString('zh-CN') : '',
      备注: order.remark || ''
    }));
    
    // 生成文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `订单导出_${timestamp}`;
    
    if (format === 'csv') {
      const csv = generateCSV(data);
      const filepath = path.join(exportDir, `${filename}.csv`);
      fs.writeFileSync(filepath, csv, 'utf-8');
      
      // 记录导出日志
      await logExport(req.user.userId, 'orders', data.length, format);
      
      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      // Excel
      const filepath = path.join(exportDir, `${filename}.xlsx`);
      await generateExcel(data, filepath, '订单数据');
      
      // 记录导出日志
      await logExport(req.user.userId, 'orders', data.length, format);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.sendFile(filepath, (err) => {
        if (!err) {
          // 删除临时文件
          setTimeout(() => fs.unlinkSync(filepath), 60000);
        }
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
    const db = getDb();
    const {
      status,
      format = 'xlsx'
    } = req.query;
    
    const query = { role: 'executor' };
    if (status) {
      query.status = status;
    }
    
    const executors = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    // 统计每个执行者的订单数据
    const executorIds = executors.map(e => e._id);
    const orderStats = await db.collection('orders').aggregate([
      {
        $match: {
          executorId: { $in: executorIds }
        }
      },
      {
        $group: {
          _id: '$executorId',
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalAmount: { $sum: '$totalPrice' }
        }
      }
    ]).toArray();
    
    const statsMap = {};
    orderStats.forEach(stat => {
      statsMap[stat._id.toString()] = stat;
    });
    
    const data = executors.map(executor => {
      const stats = statsMap[executor._id.toString()] || {
        totalOrders: 0,
        completedOrders: 0,
        totalAmount: 0
      };
      
      return {
        执行者 ID: executor._id.toString(),
        昵称: executor.nickName,
        手机号: executor.phone,
        性别: executor.gender === 1 ? '男' : executor.gender === 2 ? '女' : '未知',
        城市: executor.city,
        省份: executor.province,
        状态: getExecutorStatusName(executor.status),
        评分: executor.rating || 0,
        服务类型: (executor.serviceTypes || []).join(','),
        服务区域: (executor.serviceAreas || []).join(','),
        总订单数: stats.totalOrders,
        完成订单数: stats.completedOrders,
        完成率: stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(2) + '%' : '0%',
        总收入: stats.totalAmount,
        注册时间: executor.createdAt ? new Date(executor.createdAt).toLocaleString('zh-CN') : '',
        最后登录: executor.lastLoginAt ? new Date(executor.lastLoginAt).toLocaleString('zh-CN') : ''
      };
    });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `执行者导出_${timestamp}`;
    
    if (format === 'csv') {
      const csv = generateCSV(data);
      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      const filepath = path.join(exportDir, `${filename}.xlsx`);
      await generateExcel(data, filepath, '执行者数据');
      
      await logExport(req.user.userId, 'executors', data.length, format);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.sendFile(filepath, (err) => {
        if (!err) {
          setTimeout(() => fs.unlinkSync(filepath), 60000);
        }
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
    const db = getDb();
    const {
      format = 'xlsx'
    } = req.query;
    
    const users = await db.collection('users')
      .find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(10000)
      .toArray();
    
    const data = users.map(user => ({
      用户 ID: user._id.toString(),
      昵称: user.nickName,
      手机号: user.phone,
      性别: user.gender === 1 ? '男' : user.gender === 2 ? '女' : '未知',
      城市: user.city,
      省份: user.province,
      注册时间: user.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN') : '',
      最后登录: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-CN') : ''
    }));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `用户导出_${timestamp}`;
    
    if (format === 'csv') {
      const csv = generateCSV(data);
      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      const filepath = path.join(exportDir, `${filename}.xlsx`);
      await generateExcel(data, filepath, '用户数据');
      
      await logExport(req.user.userId, 'users', data.length, format);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.sendFile(filepath, (err) => {
        if (!err) {
          setTimeout(() => fs.unlinkSync(filepath), 60000);
        }
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
    const db = getDb();
    const {
      status,
      format = 'xlsx'
    } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const certificates = await db.collection('certificates')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(10000)
      .toArray();
    
    const userIds = certificates.filter(c => c.userId).map(c => c.userId.toString());
    const users = await db.collection('users')
      .find({ _id: { $in: userIds.map(id => ObjectId(id)) } })
      .project({ _id: 1, nickName: 1, phone: 1 })
      .toArray();
    
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });
    
    const data = certificates.map(cert => ({
      资质 ID: cert._id.toString(),
      用户: userMap[cert.userId?.toString()]?.nickName || '',
      用户手机: userMap[cert.userId?.toString()]?.phone || '',
      证书类型: cert.type,
      证书编号: cert.certificateNo,
      证书名称: cert.certificateName,
      发证日期: cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('zh-CN') : '',
      到期日期: cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('zh-CN') : '',
      审核状态: getQualificationStatusName(cert.status),
      驳回原因: cert.rejectReason || '',
      审核时间: cert.auditTime ? new Date(cert.auditTime).toLocaleString('zh-CN') : '',
      申请时间: cert.createdAt ? new Date(cert.createdAt).toLocaleString('zh-CN') : ''
    }));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `资质审核导出_${timestamp}`;
    
    if (format === 'csv') {
      const csv = generateCSV(data);
      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      const filepath = path.join(exportDir, `${filename}.xlsx`);
      await generateExcel(data, filepath, '资质审核数据');
      
      await logExport(req.user.userId, 'qualifications', data.length, format);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.sendFile(filepath, (err) => {
        if (!err) {
          setTimeout(() => fs.unlinkSync(filepath), 60000);
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// 工具函数：生成 CSV
function generateCSV(data) {
  if (data.length === 0) {
    return '';
  }
  
  const fields = Object.keys(data[0]);
  const parser = new Parser({ fields });
  return parser.parse(data);
}

// 工具函数：生成 Excel
async function generateExcel(data, filepath, sheetName) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ClearSpring Admin';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet(sheetName);
  
  if (data.length === 0) {
    workbook.xlsx.writeFile(filepath);
    return;
  }
  
  // 添加表头
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);
  
  // 设置表头样式
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // 添加数据
  data.forEach(item => {
    worksheet.addRow(headers.map(h => item[h]));
  });
  
  // 自动调整列宽
  worksheet.columns.forEach(column => {
    column.width = 20;
  });
  
  await workbook.xlsx.writeFile(filepath);
}

// 工具函数：记录导出日志
async function logExport(userId, dataType, recordCount, format) {
  try {
    const db = getDb();
    await db.collection('audit_logs').insertOne({
      type: 'admin_data_export',
      userId: ObjectId(userId),
      dataType,
      recordCount,
      format,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('记录导出日志失败:', error);
  }
}

// 工具函数：获取状态名称
function getOrderStatusName(status) {
  const map = {
    'pending': '待支付',
    'paid': '已支付',
    'grabbed': '已接单',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return map[status] || status;
}

function getPaymentStatusName(status) {
  const map = {
    'unpaid': '未支付',
    'paid': '已支付',
    'refunded': '已退款'
  };
  return map[status] || status;
}

function getExecutorStatusName(status) {
  const map = {
    'active': '活跃',
    'inactive': '未激活',
    'banned': '已禁用'
  };
  return map[status] || status;
}

function getQualificationStatusName(status) {
  const map = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已驳回'
  };
  return map[status] || status;
}

module.exports = router;
