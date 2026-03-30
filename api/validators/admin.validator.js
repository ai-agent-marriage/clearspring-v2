/**
 * 管理员 API 输入验证 Schema
 */

const Joi = require('joi');

// 通用分页参数
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20)
});

// 管理员登录验证
exports.loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required()
    .messages({
      'string.empty': '账号不能为空',
      'string.min': '账号长度至少 3 位',
      'any.required': '账号不能为空'
    }),
  password: Joi.string().min(6).max(50).required()
    .messages({
      'string.empty': '密码不能为空',
      'string.min': '密码长度至少 6 位',
      'any.required': '密码不能为空'
    })
});

// 创建管理员验证
exports.createAdminSchema = Joi.object({
  username: Joi.string().min(3).max(50).required()
    .messages({
      'string.empty': '用户名不能为空',
      'string.min': '用户名长度至少 3 位',
      'any.required': '用户名不能为空'
    }),
  password: Joi.string().min(6).max(50).required()
    .messages({
      'string.empty': '密码不能为空',
      'string.min': '密码长度至少 6 位',
      'any.required': '密码不能为空'
    }),
  nickName: Joi.string().min(1).max(50).optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional()
    .messages({
      'string.pattern.base': '手机号格式不正确'
    }),
  email: Joi.string().email().optional()
    .messages({
      'string.email': '邮箱格式不正确'
    }),
  permissions: Joi.array().items(Joi.string()).optional()
});

// 更新管理员验证
exports.updateAdminSchema = Joi.object({
  nickName: Joi.string().min(1).max(50).optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional()
    .messages({
      'string.pattern.base': '手机号格式不正确'
    }),
  email: Joi.string().email().optional()
    .messages({
      'string.email': '邮箱格式不正确'
    }),
  permissions: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('active', 'inactive').optional()
    .messages({
      'any.only': '状态只能是 active 或 inactive'
    })
});

// 重置密码验证
exports.resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).max(50).required()
    .messages({
      'string.empty': '新密码不能为空',
      'string.min': '新密码长度至少 6 位',
      'any.required': '新密码不能为空'
    })
});

// 订单状态更新验证
exports.updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'paid', 'grabbed', 'completed', 'cancelled').required()
    .messages({
      'any.only': '无效的订单状态，只能是 pending/paid/grabbed/completed/cancelled',
      'any.required': '状态不能为空'
    }),
  remark: Joi.string().max(500).optional()
});

// 资质审核验证
exports.auditQualificationSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required()
    .messages({
      'any.only': '无效的状态，只能是 approved 或 rejected',
      'any.required': '状态不能为空'
    }),
  rejectReason: Joi.string().max(500).when('status', {
    is: 'rejected',
    then: Joi.required().messages({
      'any.required': '驳回时必须填写原因'
    }),
    otherwise: Joi.optional()
  }),
  auditRemark: Joi.string().max(500).optional()
});

// 执行者状态更新验证
exports.updateExecutorStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'banned').required()
    .messages({
      'any.only': '无效的状态',
      'any.required': '状态不能为空'
    }),
  banReason: Joi.string().max(500).when('status', {
    is: 'banned',
    then: Joi.required().messages({
      'any.required': '封禁时必须填写原因'
    }),
    otherwise: Joi.optional()
  })
});

// 利润分成验证
exports.profitSharingSchema = Joi.object({
  executorId: Joi.string().length(24).required()
    .messages({
      'string.length': '执行者 ID 格式不正确',
      'any.required': '执行者 ID 不能为空'
    }),
  amount: Joi.number().positive().required()
    .messages({
      'number.positive': '金额必须为正数',
      'any.required': '金额不能为空'
    }),
  remark: Joi.string().max(500).optional()
});

// ID 参数验证
exports.idParamSchema = Joi.object({
  id: Joi.string().length(24).required()
    .messages({
      'string.length': 'ID 格式不正确',
      'any.required': 'ID 不能为空'
    })
});

// 查询参数验证组合
exports.adminListQuerySchema = paginationSchema.keys({
  status: Joi.string().valid('active', 'inactive').optional(),
  keyword: Joi.string().max(100).optional()
});

exports.orderListQuerySchema = paginationSchema.keys({
  status: Joi.string().optional(),
  paymentStatus: Joi.string().optional(),
  serviceType: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  keyword: Joi.string().max(100).optional()
});

exports.qualificationListQuerySchema = paginationSchema.keys({
  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
  type: Joi.string().optional(),
  userId: Joi.string().length(24).optional()
});

// 验证中间件工厂
exports.validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      const messages = error.details.map(detail => detail.message).join('; ');
      return res.status(400).json({
        code: 'INVALID_PARAMS',
        message: messages,
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }
    
    // 验证通过，将验证后的值附加到请求
    if (source === 'body') {
      req.body = value;
    } else if (source === 'query') {
      req.query = value;
    } else if (source === 'params') {
      req.params = value;
    }
    
    next();
  };
};
