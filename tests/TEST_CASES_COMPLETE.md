# 清如 ClearSpring V2.0 - 完整测试用例文档

**版本**: 2.0.0  
**生成时间**: 2026-03-30  
**测试框架**: Jest + Supertest  
**总用例数**: 142 个

---

## 目录

1. [API 接口测试用例 (P0) - 82 个](#1-api-接口测试用例-p0---82 个)
2. [小程序页面测试用例 (P1) - 30 个](#2-小程序页面测试用例-p1---30 个)
3. [管理后台测试用例 (P1) - 20 个](#3-管理后台测试用例-p1---20 个)
4. [云函数测试用例 (P1) - 10 个](#4-云函数测试用例-p1---10 个)

---

## 1. API 接口测试用例 (P0) - 82 个

### 1.1 管理员登录接口 (13 个用例)

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 | 状态 |
|---------|-----------|----------|----------|----------|--------|------|
| API-AUTH-001 | POST /api/admin/auth/login | 正常登录 - 有效账号密码 | username: "admin", password: "admin123" | 返回 code: "SUCCESS"，包含 token | P0 | ✅ |
| API-AUTH-002 | POST /api/admin/auth/login | 异常场景 - 账号为空 | username: "", password: "admin123" | 返回 code: "INVALID_PARAMS" | P0 | ✅ |
| API-AUTH-003 | POST /api/admin/auth/login | 异常场景 - 密码为空 | username: "admin", password: "" | 返回 code: "INVALID_PARAMS" | P0 | ✅ |
| API-AUTH-004 | POST /api/admin/auth/login | 异常场景 - 账号错误 | username: "wrongadmin", password: "admin123" | 返回 code: "AUTH_FAILED" | P0 | ✅ |
| API-AUTH-005 | POST /api/admin/auth/login | 异常场景 - 密码错误 | username: "admin", password: "wrongpass" | 返回 code: "AUTH_FAILED" | P0 | ✅ |
| API-AUTH-006 | POST /api/admin/auth/login | 异常场景 - 账号被禁用 | username: "banned_admin" | 返回 code: "AUTH_FAILED" | P0 | ✅ |
| API-AUTH-007 | POST /api/admin/auth/login | 边界场景 - 用户名超长 | username: 50 字符 | 正常处理或验证错误 | P1 | ✅ |
| API-AUTH-008 | POST /api/admin/auth/login | 异常场景 - 缺少请求体 | 空请求体 | 返回 code: "INVALID_PARAMS" | P1 | ✅ |
| API-AUTH-009 | GET /api/admin/auth/info | 正常场景 - 有效 Token | Authorization: "Bearer xxx" | 返回管理员信息 | P0 | ✅ |
| API-AUTH-010 | GET /api/admin/auth/info | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-AUTH-011 | GET /api/admin/auth/info | 异常场景 - Token 格式错误 | Authorization: "Bearer invalid" | 返回 code: "INVALID_TOKEN" | P0 | ✅ |
| API-AUTH-014 | POST /api/admin/auth/refresh | 正常场景 - Token 刷新 | refreshToken: "xxx" | 返回新 token | P0 | ✅ |
| API-AUTH-015 | POST /api/admin/auth/login | 多设备登录 | 同一账号多次登录 | 多个 token 都有效 | P0 | ✅ |

### 1.2 Dashboard 统计接口 (13 个用例)

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 | 状态 |
|---------|-----------|----------|----------|----------|--------|------|
| API-DASH-001 | GET /api/admin/dashboard/overview | 正常场景 - 默认时间范围 | 有效 Token | 返回统计数据 | P0 | ✅ |
| API-DASH-002 | GET /api/admin/dashboard/overview | 正常场景 - 自定义时间范围 | startDate, endDate | 返回指定范围统计 | P0 | ✅ |
| API-DASH-003 | GET /api/admin/dashboard/overview | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-DASH-004 | GET /api/admin/dashboard/overview | 异常场景 - 非管理员 | 普通用户 Token | 返回 code: "FORBIDDEN" | P0 | ✅ |
| API-DASH-005 | GET /api/admin/dashboard/overview | 边界场景 - 未来时间 | startDate: "2030-01-01" | 返回空统计 | P1 | ✅ |
| API-DASH-006 | GET /api/admin/dashboard/orders-trend | 正常场景 - 按天分组 | groupBy: "day" | 返回按天数据 | P1 | ✅ |
| API-DASH-007 | GET /api/admin/dashboard/orders-trend | 正常场景 - 按周分组 | groupBy: "week" | 返回按周数据 | P1 | ✅ |
| API-DASH-008 | GET /api/admin/dashboard/orders-trend | 正常场景 - 按月分组 | groupBy: "month" | 返回按月数据 | P1 | ✅ |
| API-DASH-009 | GET /api/admin/dashboard/service-types | 正常场景 - 服务类型分布 | 有效 Token | 返回分布数据 | P1 | ✅ |
| API-DASH-010 | GET /api/admin/dashboard/executors-ranking | 正常场景 - 执行者排行 | limit: 10 | 返回 Top 10 | P1 | ✅ |
| API-DASH-011 | GET /api/admin/dashboard/realtime | 正常场景 - 实时数据 | 有效 Token | 返回实时统计 | P1 | ✅ |
| API-DASH-012 | GET /api/admin/dashboard/realtime | 实时数据刷新测试 | 创建订单后查询 | 数据更新 | P0 | ✅ |
| API-DASH-013 | GET /api/admin/dashboard/overview | 大数据量性能测试 | 大量数据 | 响应<2 秒 | P0 | ✅ |

### 1.3 订单管理接口 (20 个用例)

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 | 状态 |
|---------|-----------|----------|----------|----------|--------|------|
| API-ORD-001 | GET /api/admin/orders | 正常场景 - 默认分页 | page: 1, pageSize: 20 | 返回订单列表 | P0 | ✅ |
| API-ORD-002 | GET /api/admin/orders | 正常场景 - 状态筛选 | status: "completed" | 返回已完成订单 | P0 | ✅ |
| API-ORD-003 | GET /api/admin/orders | 正常场景 - 时间范围筛选 | startDate, endDate | 返回指定范围订单 | P0 | ✅ |
| API-ORD-004 | GET /api/admin/orders | 正常场景 - 关键词搜索 | keyword: "张三" | 返回匹配订单 | P0 | ✅ |
| API-ORD-005 | GET /api/admin/orders | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-ORD-006 | GET /api/admin/orders | 边界场景 - 空结果 | 不存在的条件 | 返回空列表 | P1 | ✅ |
| API-ORD-007 | GET /api/admin/orders | 边界场景 - 超大页码 | page: 99999 | 返回空列表 | P1 | ✅ |
| API-ORD-008 | PUT /api/admin/orders/:id/status | 正常场景 - 更新为已完成 | status: "completed" | 更新成功 | P0 | ✅ |
| API-ORD-009 | PUT /api/admin/orders/:id/status | 正常场景 - 更新为已取消 | status: "cancelled" | 更新成功 | P0 | ✅ |
| API-ORD-010 | PUT /api/admin/orders/:id/status | 异常场景 - 订单不存在 | id: 不存在的 ID | 返回 code: "ORDER_NOT_FOUND" | P0 | ✅ |
| API-ORD-011 | PUT /api/admin/orders/:id/status | 异常场景 - 无效状态 | status: "invalid" | 返回 code: "INVALID_STATUS" | P0 | ✅ |
| API-ORD-012 | PUT /api/admin/orders/:id/status | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-ORD-013 | PUT /api/admin/orders/:id/status | 边界场景 - 重复更新 | 相同状态 | 正常处理 | P1 | ✅ |
| API-ORD-014 | DELETE /api/admin/orders/:id | 正常场景 - 删除已取消订单 | id: 已取消 ID | 删除成功 | P0 | ✅ |
| API-ORD-015 | DELETE /api/admin/orders/:id | 异常场景 - 删除非取消订单 | id: 进行中 ID | 返回 code: "ORDER_CANNOT_DELETE" | P0 | ✅ |
| API-ORD-016 | DELETE /api/admin/orders/:id | 异常场景 - 订单不存在 | id: 不存在的 ID | 返回 code: "ORDER_NOT_FOUND" | P0 | ✅ |
| API-ORD-017 | PUT /api/admin/orders/:id/status | 订单状态流转 | pending→in_progress→completed | 流转成功 | P0 | ✅ |
| API-ORD-018 | PUT /api/admin/orders/:id/status | 订单取消流程 | status: "cancelled" | 取消成功 | P0 | ✅ |
| API-ORD-019 | POST /api/admin/orders/:id/refund | 订单退款流程 | refundAmount: 100 | 退款成功 | P0 | ✅ |
| API-ORD-020 | POST /api/admin/orders | 超时自动取消 | paymentTimeout: 1 | 自动取消 | P0 | ✅ |

### 1.4 资质审核接口 (13 个用例)

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 | 状态 |
|---------|-----------|----------|----------|----------|--------|------|
| API-QUAL-001 | GET /api/admin/qualifications | 正常场景 - 默认分页 | page: 1, pageSize: 20 | 返回列表 | P0 | ✅ |
| API-QUAL-002 | GET /api/admin/qualifications | 正常场景 - 状态筛选 | status: "pending" | 返回待审核 | P0 | ✅ |
| API-QUAL-003 | GET /api/admin/qualifications | 正常场景 - 类型筛选 | type: "health_cert" | 返回指定类型 | P0 | ✅ |
| API-QUAL-004 | GET /api/admin/qualifications | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-QUAL-005 | PUT /api/admin/qualifications/:id | 正常场景 - 审核通过 | status: "approved" | 审核成功 | P0 | ✅ |
| API-QUAL-006 | PUT /api/admin/qualifications/:id | 正常场景 - 审核驳回 | status: "rejected", reason: "xxx" | 驳回成功 | P0 | ✅ |
| API-QUAL-007 | PUT /api/admin/qualifications/:id | 异常场景 - 驳回无原因 | status: "rejected", reason: "" | 返回 code: "MISSING_REJECT_REASON" | P0 | ✅ |
| API-QUAL-008 | PUT /api/admin/qualifications/:id | 异常场景 - 无效状态 | status: "invalid" | 返回 code: "INVALID_STATUS" | P0 | ✅ |
| API-QUAL-009 | PUT /api/admin/qualifications/:id | 异常场景 - 资质不存在 | id: 不存在的 ID | 返回 code: "CERTIFICATE_NOT_FOUND" | P0 | ✅ |
| API-QUAL-010 | PUT /api/admin/qualifications/:id | 异常场景 - 重复审核 | id: 已审核 ID | 返回 code: "CERTIFICATE_ALREADY_AUDITED" | P0 | ✅ |
| API-QUAL-011 | PUT /api/admin/qualifications/:id | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-QUAL-012 | POST /api/admin/qualifications/batch-audit | 批量审核 | ids: [], status: "approved" | 批量成功 | P0 | ✅ |
| API-QUAL-013 | GET /api/admin/qualifications/expiring | 资质过期提醒 | days: 30 | 返回即将过期列表 | P0 | ✅ |

### 1.5 申诉仲裁接口 (8 个用例)

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 | 状态 |
|---------|-----------|----------|----------|----------|--------|------|
| API-APPL-001 | GET /api/admin/appeals | 正常场景 - 申诉列表 | page: 1, pageSize: 20 | 返回列表 | P0 | ✅ |
| API-APPL-002 | GET /api/admin/appeals | 正常场景 - 状态筛选 | status: "pending" | 返回待处理 | P0 | ✅ |
| API-APPL-003 | GET /api/admin/appeals | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-APPL-004 | PUT /api/admin/appeals/:id/arbitrate | 正常场景 - 仲裁处理 | result: "approved" | 仲裁成功 | P0 | ✅ |
| API-APPL-005 | PUT /api/admin/appeals/:id/arbitrate | 异常场景 - 申诉不存在 | id: 不存在的 ID | 返回 code: "APPEAL_NOT_FOUND" | P0 | ✅ |
| API-APPL-006 | PUT /api/admin/appeals/:id/arbitrate | 异常场景 - 重复仲裁 | id: 已处理 ID | 返回 code: "APPEAL_ALREADY_ARBITRATED" | P0 | ✅ |
| API-APPL-007 | GET /api/admin/appeals/timeout-check | 申诉超时检查 | - | 检查成功 | P0 | ✅ |
| API-APPL-008 | POST /api/admin/appeals/:id/escalate | 申诉升级 | targetLevel: "senior" | 升级成功 | P0 | ✅ |

### 1.6 执行者管理接口 (13 个用例)

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 | 状态 |
|---------|-----------|----------|----------|----------|--------|------|
| API-EXEC-001 | GET /api/admin/executors | 正常场景 - 默认分页 | page: 1, pageSize: 20 | 返回列表 | P0 | ✅ |
| API-EXEC-002 | GET /api/admin/executors | 正常场景 - 状态筛选 | status: "active" | 返回活跃 | P0 | ✅ |
| API-EXEC-003 | GET /api/admin/executors | 正常场景 - 关键词搜索 | keyword: "李四" | 返回匹配 | P0 | ✅ |
| API-EXEC-004 | GET /api/admin/executors | 正常场景 - 服务类型筛选 | serviceType: "cleaning" | 返回指定类型 | P0 | ✅ |
| API-EXEC-005 | GET /api/admin/executors | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-EXEC-006 | PUT /api/admin/executors/:id/status | 正常场景 - 激活 | status: "active" | 激活成功 | P0 | ✅ |
| API-EXEC-007 | PUT /api/admin/executors/:id/status | 正常场景 - 禁用 | status: "banned" | 禁用成功 | P0 | ✅ |
| API-EXEC-008 | PUT /api/admin/executors/:id/status | 异常场景 - 无效状态 | status: "invalid" | 返回 code: "INVALID_STATUS" | P0 | ✅ |
| API-EXEC-009 | PUT /api/admin/executors/:id/status | 异常场景 - 执行者不存在 | id: 不存在的 ID | 返回 code: "EXECUTOR_NOT_FOUND" | P0 | ✅ |
| API-EXEC-010 | PUT /api/admin/executors/:id/status | 异常场景 - 非执行者 | id: 普通用户 ID | 返回 code: "EXECUTOR_NOT_FOUND" | P0 | ✅ |
| API-EXEC-011 | PUT /api/admin/executors/:id/status | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-EXEC-012 | PUT /api/admin/executors/:id/rating | 执行者评级 | rating: 4.5 | 更新成功 | P0 | ✅ |
| API-EXEC-013 | PUT /api/admin/executors/:id/service-areas | 服务区域 | areas: [] | 更新成功 | P0 | ✅ |

### 1.7 分账配置接口 (10 个用例)

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 | 状态 |
|---------|-----------|----------|----------|----------|--------|------|
| API-PROF-001 | GET /api/admin/profit-sharing | 正常场景 - 获取配置 | 有效 Token | 返回配置 | P0 | ✅ |
| API-PROF-002 | GET /api/admin/profit-sharing | 正常场景 - 默认配置 | 首次访问 | 返回默认配置 | P0 | ✅ |
| API-PROF-003 | GET /api/admin/profit-sharing | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-PROF-004 | PUT /api/admin/profit-sharing | 正常场景 - 更新配置 | platformRate: 0.1 | 更新成功 | P0 | ✅ |
| API-PROF-005 | PUT /api/admin/profit-sharing | 异常场景 - 平台比例超限 | platformRate: 1.5 | 返回 code: "INVALID_PLATFORM_RATE" | P0 | ✅ |
| API-PROF-006 | PUT /api/admin/profit-sharing | 异常场景 - 执行者比例超限 | executorMinRate: -0.1 | 返回 code: "INVALID_EXECUTOR_MIN_RATE" | P0 | ✅ |
| API-PROF-007 | PUT /api/admin/profit-sharing | 异常场景 - 比例总和超限 | platformRate + executorRate > 1 | 返回 code: "INVALID_RATE_SUM" | P0 | ✅ |
| API-PROF-008 | PUT /api/admin/profit-sharing | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-PROF-009 | PUT /api/admin/profit-sharing | 分账计算精度 | 4 位小数 | 精度处理正确 | P0 | ✅ |
| API-PROF-010 | GET /api/admin/profit-sharing/history | 分账历史 | - | 返回历史记录 | P0 | ✅ |

### 1.8 数据导出接口 (10 个用例)

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 | 状态 |
|---------|-----------|----------|----------|----------|--------|------|
| API-EXPT-001 | GET /api/admin/export/orders | 正常场景 - 导出 Excel | format: "xlsx" | 返回 xlsx 文件 | P0 | ✅ |
| API-EXPT-002 | GET /api/admin/export/orders | 正常场景 - 导出 CSV | format: "csv" | 返回 csv 文件 | P0 | ✅ |
| API-EXPT-003 | GET /api/admin/export/orders | 正常场景 - 时间范围筛选 | startDate, endDate | 返回指定范围 | P0 | ✅ |
| API-EXPT-004 | GET /api/admin/export/orders | 正常场景 - 状态筛选 | status: "completed" | 返回已完成 | P0 | ✅ |
| API-EXPT-005 | GET /api/admin/export/orders | 异常场景 - 无 Token | 无 Authorization | 返回 code: "UNAUTHORIZED" | P0 | ✅ |
| API-EXPT-006 | GET /api/admin/export/executors | 正常场景 - 导出执行者 | format: "xlsx" | 返回 xlsx 文件 | P0 | ✅ |
| API-EXPT-007 | GET /api/admin/export/users | 正常场景 - 导出用户 | format: "xlsx" | 返回 xlsx 文件 | P0 | ✅ |
| API-EXPT-008 | GET /api/admin/export/qualifications | 正常场景 - 导出资质 | format: "xlsx" | 返回 xlsx 文件 | P0 | ✅ |
| API-EXPT-009 | GET /api/admin/export/orders | 大数据量导出 | 大量数据 | 响应<10 秒 | P0 | ✅ |
| API-EXPT-010 | GET /api/admin/export/orders | CSV 格式验证 | format: "csv" | 包含表头 | P0 | ✅ |

### 1.9 系统设置接口 (4 个用例)

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 | 状态 |
|---------|-----------|----------|----------|----------|--------|------|
| API-SETT-001 | PUT /api/admin/settings | 更新系统配置 | siteName, phone | 更新成功 | P0 | ✅ |
| API-SETT-001-2 | PUT /api/admin/settings | 无效配置项 | invalidField | 返回 code: "INVALID_SETTINGS_FIELD" | P0 | ✅ |
| API-SETT-002 | GET /api/admin/settings/history | 配置历史 | - | 返回历史记录 | P0 | ✅ |

---

## 2. 小程序页面测试用例 (P1) - 30 个

### 2.1 用户登录流程 (4 个用例)

| 用例 ID | 页面 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| MP-LOGIN-001 | 登录页 | 微信授权登录 | 点击微信登录按钮 | 成功跳转并获取用户信息 | P0 |
| MP-LOGIN-002 | 登录页 | 手机号绑定 | 输入手机号并验证 | 绑定成功 | P0 |
| MP-LOGIN-003 | 登录页 | 登录状态保持 | 关闭小程序后重新打开 | 保持登录状态 | P0 |
| MP-LOGIN-004 | 登录页 | 退出登录 | 点击退出按钮 | 成功退出并跳转登录页 | P1 |

### 2.2 订单创建流程 (4 个用例)

| 用例 ID | 页面 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| MP-ORDER-001 | 订单创建页 | 选择服务类型 | 选择保洁服务 | 显示对应服务选项 | P0 |
| MP-ORDER-002 | 订单创建页 | 填写服务信息 | 填写时间、地址等 | 信息保存成功 | P0 |
| MP-ORDER-003 | 订单创建页 | 提交订单 | 点击提交按钮 | 订单创建成功 | P0 |
| MP-ORDER-004 | 订单创建页 | 订单支付 | 点击支付按钮 | 支付成功并跳转 | P0 |

### 2.3 抢单流程 (4 个用例)

| 用例 ID | 页面 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| MP-GRAB-001 | 抢单页 | 浏览可抢订单 | 进入抢单页面 | 显示可抢订单列表 | P0 |
| MP-GRAB-002 | 抢单页 | 抢单操作 | 点击抢单按钮 | 抢单成功 | P0 |
| MP-GRAB-003 | 抢单页 | 抢单限制 | 超出服务区域 | 提示无法抢单 | P0 |
| MP-GRAB-004 | 抢单页 | 抢单冲突 | 多人同时抢单 | 只有一人成功 | P0 |

### 2.4 支付流程 (4 个用例)

| 用例 ID | 页面 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| MP-PAY-001 | 支付页 | 微信支付 | 选择微信支付 | 支付成功 | P0 |
| MP-PAY-002 | 支付页 | 支付取消 | 取消支付 | 返回订单页 | P0 |
| MP-PAY-003 | 支付页 | 支付超时 | 超时未支付 | 订单自动取消 | P0 |
| MP-PAY-004 | 支付页 | 支付回调 | 支付完成后回调 | 订单状态更新 | P0 |

### 2.5 资质审核流程 (4 个用例)

| 用例 ID | 页面 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| MP-QUAL-001 | 资质上传页 | 上传健康证 | 选择图片并上传 | 上传成功 | P1 |
| MP-QUAL-002 | 资质上传页 | 上传技能证 | 选择证书并上传 | 上传成功 | P1 |
| MP-QUAL-003 | 资质上传页 | 查看审核状态 | 进入资质页面 | 显示审核进度 | P1 |
| MP-QUAL-004 | 资质上传页 | 重新上传 | 审核被驳回 | 可以重新上传 | P1 |

### 2.6 申诉仲裁流程 (4 个用例)

| 用例 ID | 页面 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| MP-APPL-001 | 申诉页 | 发起申诉 | 选择订单并填写原因 | 申诉提交成功 | P1 |
| MP-APPL-002 | 申诉页 | 上传证据 | 上传图片证据 | 上传成功 | P1 |
| MP-APPL-003 | 申诉页 | 查看仲裁结果 | 进入申诉详情 | 显示仲裁结果 | P1 |
| MP-APPL-004 | 申诉页 | 申诉撤销 | 撤销已提交的申诉 | 撤销成功 | P2 |

### 2.7 数据导出功能 (4 个用例)

| 用例 ID | 页面 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| MP-EXPT-001 | 订单记录页 | 导出订单记录 | 点击导出按钮 | 导出成功 | P1 |
| MP-EXPT-002 | 收入明细页 | 导出收入明细 | 点击导出按钮 | 导出成功 | P1 |
| MP-EXPT-003 | 数据导出页 | 选择导出格式 | 选择 Excel/CSV | 格式正确 | P1 |
| MP-EXPT-004 | 数据导出页 | 导出历史记录 | 查看导出历史 | 显示历史列表 | P2 |

### 2.8 设置页面 (2 个用例)

| 用例 ID | 页面 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| MP-SETT-001 | 设置页 | 修改个人信息 | 编辑昵称、头像 | 保存成功 | P2 |
| MP-SETT-002 | 设置页 | 消息通知设置 | 开关通知 | 设置生效 | P2 |

### 2.9 帮助文档 (2 个用例)

| 用例 ID | 页面 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| MP-HELP-001 | 帮助页 | 查看常见问题 | 进入帮助页面 | 显示问题列表 | P2 |
| MP-HELP-002 | 帮助页 | 联系客服 | 点击客服按钮 | 跳转客服会话 | P2 |

### 2.10 错误页面 (2 个用例)

| 用例 ID | 页面 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| MP-ERR-001 | 404 页 | 访问不存在页面 | 输入错误路径 | 显示 404 页面 | P2 |
| MP-ERR-002 | 错误页 | 网络错误 | 断开网络访问 | 显示错误提示 | P2 |

---

## 3. 管理后台测试用例 (P1) - 20 个

### 3.1 登录页组件 (3 个用例)

| 用例 ID | 组件 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| ADM-LOGIN-001 | Login.vue | 表单验证 | 输入空账号密码 | 显示验证错误 | P0 |
| ADM-LOGIN-002 | Login.vue | 登录成功 | 输入正确账号密码 | 跳转 Dashboard | P0 |
| ADM-LOGIN-003 | Login.vue | 登录失败 | 输入错误账号密码 | 显示错误提示 | P0 |

### 3.2 Dashboard 组件 (3 个用例)

| 用例 ID | 组件 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| ADM-DASH-001 | Dashboard.vue | 数据加载 | 进入页面 | 显示统计数据 | P0 |
| ADM-DASH-002 | Dashboard.vue | 图表渲染 | 查看趋势图 | 图表正常显示 | P0 |
| ADM-DASH-003 | Dashboard.vue | 数据刷新 | 点击刷新按钮 | 数据更新 | P0 |

### 3.3 订单列表组件 (3 个用例)

| 用例 ID | 组件 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| ADM-ORD-001 | OrderList.vue | 列表加载 | 进入页面 | 显示订单列表 | P0 |
| ADM-ORD-002 | OrderList.vue | 筛选功能 | 选择状态筛选 | 列表更新 | P0 |
| ADM-ORD-003 | OrderList.vue | 分页功能 | 切换页码 | 显示对应数据 | P0 |

### 3.4 资质审核组件 (2 个用例)

| 用例 ID | 组件 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| ADM-QUAL-001 | QualificationAudit.vue | 审核通过 | 点击通过按钮 | 审核成功 | P1 |
| ADM-QUAL-002 | QualificationAudit.vue | 审核驳回 | 点击驳回并填写原因 | 驳回成功 | P1 |

### 3.5 申诉仲裁组件 (2 个用例)

| 用例 ID | 组件 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| ADM-APPL-001 | AppealArbitration.vue | 仲裁处理 | 选择仲裁结果并提交 | 仲裁成功 | P1 |
| ADM-APPL-002 | AppealArbitration.vue | 查看详情 | 点击申诉详情 | 显示完整信息 | P1 |

### 3.6 执行者管理组件 (2 个用例)

| 用例 ID | 组件 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| ADM-EXEC-001 | ExecutorManage.vue | 状态切换 | 激活/禁用执行者 | 状态更新 | P1 |
| ADM-EXEC-002 | ExecutorManage.vue | 搜索功能 | 输入关键词搜索 | 显示匹配结果 | P1 |

### 3.7 分账配置组件 (2 个用例)

| 用例 ID | 组件 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| ADM-PROF-001 | ProfitSharing.vue | 配置加载 | 进入页面 | 显示当前配置 | P1 |
| ADM-PROF-002 | ProfitSharing.vue | 配置保存 | 修改配置并保存 | 保存成功 | P1 |

### 3.8 数据导出组件 (2 个用例)

| 用例 ID | 组件 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| ADM-EXPT-001 | DataExport.vue | 选择导出类型 | 选择订单/用户等 | 选项正常 | P1 |
| ADM-EXPT-002 | DataExport.vue | 导出执行 | 点击导出按钮 | 下载文件 | P1 |

### 3.9 系统设置组件 (1 个用例)

| 用例 ID | 组件 | 测试场景 | 操作步骤 | 预期结果 | 优先级 |
|---------|------|----------|----------|----------|--------|
| ADM-SETT-001 | SystemSettings.vue | 配置修改 | 修改设置并保存 | 保存成功 | P2 |

---

## 4. 云函数测试用例 (P1) - 10 个

### 4.1 用户登录云函数 (1 个用例)

| 用例 ID | 云函数 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|--------|----------|----------|----------|--------|
| CF-LOGIN-001 | login | 微信登录 | code: "wx_code" | 返回用户信息和 token | P0 |

### 4.2 管理员登录云函数 (1 个用例)

| 用例 ID | 云函数 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|--------|----------|----------|----------|--------|
| CF-ADMIN-001 | adminLogin | 管理员登录 | username, password | 返回管理员信息和 token | P0 |

### 4.3 创建订单云函数 (1 个用例)

| 用例 ID | 云函数 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|--------|----------|----------|----------|--------|
| CF-ORDER-001 | createOrder | 创建订单 | 订单信息 | 返回订单 ID | P0 |

### 4.4 抢单云函数 (1 个用例)

| 用例 ID | 云函数 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|--------|----------|----------|----------|--------|
| CF-GRAB-001 | grabOrder | 抢单 | orderId, executorId | 抢单成功 | P0 |

### 4.5 上传凭证云函数 (1 个用例)

| 用例 ID | 云函数 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|--------|----------|----------|----------|--------|
| CF-EVID-001 | uploadEvidence | 上传凭证 | file, orderId | 上传成功 | P1 |

### 4.6 获取冥想数据云函数 (1 个用例)

| 用例 ID | 云函数 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|--------|----------|----------|----------|--------|
| CF-MED-001 | getMeditationData | 获取数据 | userId | 返回冥想数据 | P1 |

### 4.7 获取冥想统计云函数 (1 个用例)

| 用例 ID | 云函数 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|--------|----------|----------|----------|--------|
| CF-MED-002 | getMeditationStats | 获取统计 | userId | 返回统计数据 | P2 |

### 4.8 获取 Wiki 内容云函数 (1 个用例)

| 用例 ID | 云函数 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|--------|----------|----------|----------|--------|
| CF-WIKI-001 | getWikiContent | 获取内容 | categoryId | 返回 Wiki 内容 | P2 |

### 4.9 记录冥想云函数 (1 个用例)

| 用例 ID | 云函数 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|--------|----------|----------|----------|--------|
| CF-MED-003 | recordMeditation | 记录冥想 | duration, date | 记录成功 | P2 |

### 4.10 记录仪式进度云函数 (1 个用例)

| 用例 ID | 云函数 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|--------|----------|----------|----------|--------|
| CF-RIT-001 | recordRitualProgress | 记录进度 | ritualId, progress | 记录成功 | P2 |

---

## 附录

### A. 测试优先级说明

- **P0**: 核心功能，必须测试，影响上线
- **P1**: 重要功能，应该测试，影响用户体验
- **P2**: 辅助功能，可以延后测试

### B. 测试执行顺序

1. 先执行 P0 用例 (API 测试)
2. 再执行 P1 用例 (前端测试)
3. 最后执行 P2 用例 (辅助功能)

### C. 测试环境要求

- API 测试：需要运行中的后端服务
- 小程序测试：需要微信开发者工具
- 管理后台测试：需要运行中的前端服务
- 云函数测试：需要微信云开发环境

---

**文档维护**: ClearSpring 测试团队  
**最后更新**: 2026-03-30  
**版本**: V2.0.0
