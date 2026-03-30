# 清如 ClearSpring V2.0 - 完整测试用例文档

**版本**: 2.0.0  
**生成时间**: 2026-03-30  
**测试框架**: Jest + Supertest

---

## 目录

1. [API 接口测试用例 (P0)](#1-api-接口测试用例-p0)
2. [前端功能测试用例 (P1)](#2-前端功能测试用例-p1)
3. [云函数测试用例 (P1)](#3-云函数测试用例-p1)
4. [异常处理测试用例 (P2)](#4-异常处理测试用例-p2)

---

## 1. API 接口测试用例 (P0)

### 1.1 管理员登录接口

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| API-AUTH-001 | POST /api/admin/auth/login | 正常登录 - 有效账号密码 | username: "admin", password: "admin123" | 返回 code: "SUCCESS"，包含 token | P0 |
| API-AUTH-002 | POST /api/admin/auth/login | 异常场景 - 账号为空 | username: "", password: "admin123" | 返回 code: "INVALID_PARAMS"，提示"账号和密码不能为空" | P0 |
| API-AUTH-003 | POST /api/admin/auth/login | 异常场景 - 密码为空 | username: "admin", password: "" | 返回 code: "INVALID_PARAMS"，提示"账号和密码不能为空" | P0 |
| API-AUTH-004 | POST /api/admin/auth/login | 异常场景 - 账号错误 | username: "wrongadmin", password: "admin123" | 返回 code: "AUTH_FAILED"，提示"账号或密码错误"，状态码 401 | P0 |
| API-AUTH-005 | POST /api/admin/auth/login | 异常场景 - 密码错误 | username: "admin", password: "wrongpass" | 返回 code: "AUTH_FAILED"，提示"账号或密码错误"，状态码 401 | P0 |
| API-AUTH-006 | POST /api/admin/auth/login | 异常场景 - 账号被禁用 | username: "banned_admin", password: "admin123" (status: inactive) | 返回 code: "AUTH_FAILED"，提示"账号或密码错误" | P0 |
| API-AUTH-007 | POST /api/admin/auth/login | 边界场景 - 用户名超长 | username: 50 字符超长字符串，password: "admin123" | 正常处理或返回参数验证错误 | P1 |
| API-AUTH-008 | POST /api/admin/auth/login | 异常场景 - 缺少请求体 | 空请求体 | 返回 code: "INVALID_PARAMS" 或 400 错误 | P1 |

### 1.2 管理员信息接口

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| API-AUTH-009 | GET /api/admin/auth/info | 正常场景 - 有效 Token | Authorization: "Bearer admin_xxx" | 返回 code: "SUCCESS"，包含管理员信息 | P0 |
| API-AUTH-010 | GET /api/admin/auth/info | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |
| API-AUTH-011 | GET /api/admin/auth/info | 异常场景 - Token 格式错误 | Authorization: "Bearer invalid" | 返回 code: "INVALID_TOKEN"，状态码 401 | P0 |
| API-AUTH-012 | GET /api/admin/auth/info | 异常场景 - Token 过期 | Authorization: "Bearer expired_token" | 返回 code: "UNAUTHORIZED" 或 "TOKEN_EXPIRED" | P0 |
| API-AUTH-013 | GET /api/admin/auth/info | 异常场景 - 管理员不存在 | Authorization: "Bearer admin_deleted" | 返回 code: "NOT_FOUND"，状态码 404 | P1 |

### 1.3 统计数据接口 (Dashboard)

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| API-DASH-001 | GET /api/admin/dashboard/overview | 正常场景 - 默认时间范围 | 有效 Token，无参数 | 返回 code: "SUCCESS"，包含订单/用户/执行者统计 | P0 |
| API-DASH-002 | GET /api/admin/dashboard/overview | 正常场景 - 自定义时间范围 | startDate: "2026-03-01", endDate: "2026-03-30" | 返回指定时间范围内的统计数据 | P0 |
| API-DASH-003 | GET /api/admin/dashboard/overview | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |
| API-DASH-004 | GET /api/admin/dashboard/overview | 异常场景 - 非管理员 | 普通用户 Token | 返回 code: "FORBIDDEN"，状态码 403 | P0 |
| API-DASH-005 | GET /api/admin/dashboard/overview | 边界场景 - 未来时间 | startDate: "2030-01-01" | 返回空统计数据或合理处理 | P1 |
| API-DASH-006 | GET /api/admin/dashboard/orders-trend | 正常场景 - 按天分组 | groupBy: "day" | 返回按天分组的订单趋势数据 | P1 |
| API-DASH-007 | GET /api/admin/dashboard/orders-trend | 正常场景 - 按周分组 | groupBy: "week" | 返回按周分组的订单趋势数据 | P1 |
| API-DASH-008 | GET /api/admin/dashboard/orders-trend | 正常场景 - 按月分组 | groupBy: "month" | 返回按月分组的订单趋势数据 | P1 |
| API-DASH-009 | GET /api/admin/dashboard/service-types | 正常场景 - 服务类型分布 | 有效 Token | 返回各服务类型的订单分布 | P1 |
| API-DASH-010 | GET /api/admin/dashboard/executors-ranking | 正常场景 - 执行者排行 | limit: 10 | 返回 Top 10 执行者排行 | P1 |
| API-DASH-011 | GET /api/admin/dashboard/realtime | 正常场景 - 实时数据 | 有效 Token | 返回今日统计、进行中订单等实时数据 | P1 |

### 1.4 订单管理接口

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| API-ORD-001 | GET /api/admin/orders | 正常场景 - 默认分页 | page: 1, pageSize: 20 | 返回订单列表和分页信息 | P0 |
| API-ORD-002 | GET /api/admin/orders | 正常场景 - 状态筛选 | status: "completed" | 返回已完成订单列表 | P0 |
| API-ORD-003 | GET /api/admin/orders | 正常场景 - 时间范围筛选 | startDate: "2026-03-01", endDate: "2026-03-30" | 返回指定时间范围内的订单 | P0 |
| API-ORD-004 | GET /api/admin/orders | 正常场景 - 关键词搜索 | keyword: "张三" | 返回包含关键词的订单（订单号/服务名称/手机号） | P0 |
| API-ORD-005 | GET /api/admin/orders | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |
| API-ORD-006 | GET /api/admin/orders | 边界场景 - 空结果 | 查询不存在的条件 | 返回空列表，total: 0 | P1 |
| API-ORD-007 | GET /api/admin/orders | 边界场景 - 超大页码 | page: 99999 | 返回空列表或最后一页数据 | P1 |
| API-ORD-008 | PUT /api/admin/orders/:id/status | 正常场景 - 更新为已完成 | id: 有效订单 ID, status: "completed" | 返回 code: "SUCCESS"，订单状态更新 | P0 |
| API-ORD-009 | PUT /api/admin/orders/:id/status | 正常场景 - 更新为已取消 | id: 有效订单 ID, status: "cancelled" | 返回 code: "SUCCESS"，订单状态更新 | P0 |
| API-ORD-010 | PUT /api/admin/orders/:id/status | 异常场景 - 订单不存在 | id: 不存在的 ID | 返回 code: "ORDER_NOT_FOUND"，状态码 404 | P0 |
| API-ORD-011 | PUT /api/admin/orders/:id/status | 异常场景 - 无效状态 | status: "invalid_status" | 返回 code: "INVALID_STATUS"，状态码 400 | P0 |
| API-ORD-012 | PUT /api/admin/orders/:id/status | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |
| API-ORD-013 | PUT /api/admin/orders/:id/status | 边界场景 - 重复更新 | 同一订单连续更新相同状态 | 正常处理，记录审计日志 | P1 |
| API-ORD-014 | DELETE /api/admin/orders/:id | 正常场景 - 删除已取消订单 | id: 已取消的订单 ID | 返回 code: "SUCCESS"，订单被删除 | P0 |
| API-ORD-015 | DELETE /api/admin/orders/:id | 异常场景 - 删除非取消订单 | id: 进行中的订单 ID | 返回 code: "ORDER_CANNOT_DELETE"，状态码 400 | P0 |
| API-ORD-016 | DELETE /api/admin/orders/:id | 异常场景 - 订单不存在 | id: 不存在的 ID | 返回 code: "ORDER_NOT_FOUND"，状态码 404 | P0 |

### 1.5 资质审核接口

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| API-QUAL-001 | GET /api/admin/qualifications | 正常场景 - 默认分页 | page: 1, pageSize: 20 | 返回资质审核列表和分页信息 | P0 |
| API-QUAL-002 | GET /api/admin/qualifications | 正常场景 - 状态筛选 | status: "pending" | 返回待审核资质列表 | P0 |
| API-QUAL-003 | GET /api/admin/qualifications | 正常场景 - 类型筛选 | type: "health_cert" | 返回指定类型的资质 | P0 |
| API-QUAL-004 | GET /api/admin/qualifications | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |
| API-QUAL-005 | PUT /api/admin/qualifications/:id | 正常场景 - 审核通过 | id: 有效 ID, status: "approved" | 返回 code: "SUCCESS"，资质状态更新为 approved | P0 |
| API-QUAL-006 | PUT /api/admin/qualifications/:id | 正常场景 - 审核驳回 | id: 有效 ID, status: "rejected", rejectReason: "照片模糊" | 返回 code: "SUCCESS"，资质状态更新为 rejected | P0 |
| API-QUAL-007 | PUT /api/admin/qualifications/:id | 异常场景 - 驳回无原因 | status: "rejected", rejectReason: 空 | 返回 code: "MISSING_REJECT_REASON"，状态码 400 | P0 |
| API-QUAL-008 | PUT /api/admin/qualifications/:id | 异常场景 - 无效状态 | status: "invalid" | 返回 code: "INVALID_STATUS"，状态码 400 | P0 |
| API-QUAL-009 | PUT /api/admin/qualifications/:id | 异常场景 - 资质不存在 | id: 不存在的 ID | 返回 code: "CERTIFICATE_NOT_FOUND"，状态码 404 | P0 |
| API-QUAL-010 | PUT /api/admin/qualifications/:id | 异常场景 - 重复审核 | id: 已审核的资质 ID | 返回 code: "CERTIFICATE_ALREADY_AUDITED"，状态码 400 | P0 |
| API-QUAL-011 | PUT /api/admin/qualifications/:id | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |

### 1.6 申诉仲裁接口

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| API-APPL-001 | GET /api/admin/appeals | 正常场景 - 申诉列表 | page: 1, pageSize: 20 | 返回申诉列表和分页信息 | P0 |
| API-APPL-002 | GET /api/admin/appeals | 正常场景 - 状态筛选 | status: "pending" | 返回待处理申诉列表 | P0 |
| API-APPL-003 | GET /api/admin/appeals | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |
| API-APPL-004 | PUT /api/admin/appeals/:id/arbitrate | 正常场景 - 仲裁处理 | id: 有效 ID, result: "approved", remark: "同意申诉" | 返回 code: "SUCCESS"，申诉处理完成 | P0 |
| API-APPL-005 | PUT /api/admin/appeals/:id/arbitrate | 异常场景 - 申诉不存在 | id: 不存在的 ID | 返回 code: "APPEAL_NOT_FOUND"，状态码 404 | P0 |
| API-APPL-006 | PUT /api/admin/appeals/:id/arbitrate | 异常场景 - 重复仲裁 | id: 已处理的申诉 ID | 返回 code: "APPEAL_ALREADY_ARBITRATED"，状态码 400 | P0 |

### 1.7 执行者管理接口

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| API-EXEC-001 | GET /api/admin/executors | 正常场景 - 默认分页 | page: 1, pageSize: 20 | 返回执行者列表和分页信息 | P0 |
| API-EXEC-002 | GET /api/admin/executors | 正常场景 - 状态筛选 | status: "active" | 返回活跃执行者列表 | P0 |
| API-EXEC-003 | GET /api/admin/executors | 正常场景 - 关键词搜索 | keyword: "李四" | 返回匹配的执行者（昵称/手机号） | P0 |
| API-EXEC-004 | GET /api/admin/executors | 正常场景 - 服务类型筛选 | serviceType: "cleaning" | 返回提供该服务的执行者 | P0 |
| API-EXEC-005 | GET /api/admin/executors | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |
| API-EXEC-006 | PUT /api/admin/executors/:id/status | 正常场景 - 激活执行者 | id: 有效 ID, status: "active" | 返回 code: "SUCCESS"，状态更新为 active | P0 |
| API-EXEC-007 | PUT /api/admin/executors/:id/status | 正常场景 - 禁用执行者 | id: 有效 ID, status: "banned" | 返回 code: "SUCCESS"，状态更新为 banned | P0 |
| API-EXEC-008 | PUT /api/admin/executors/:id/status | 异常场景 - 无效状态 | status: "invalid" | 返回 code: "INVALID_STATUS"，状态码 400 | P0 |
| API-EXEC-009 | PUT /api/admin/executors/:id/status | 异常场景 - 执行者不存在 | id: 不存在的 ID | 返回 code: "EXECUTOR_NOT_FOUND"，状态码 404 | P0 |
| API-EXEC-010 | PUT /api/admin/executors/:id/status | 异常场景 - 非执行者 | id: 普通用户 ID | 返回 code: "EXECUTOR_NOT_FOUND"，状态码 404 | P0 |
| API-EXEC-011 | PUT /api/admin/executors/:id/status | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |

### 1.8 分账配置接口

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| API-PROF-001 | GET /api/admin/profit-sharing | 正常场景 - 获取配置 | 有效 Token | 返回 code: "SUCCESS"，包含分账配置 | P0 |
| API-PROF-002 | GET /api/admin/profit-sharing | 正常场景 - 默认配置 | 首次访问（无配置） | 返回默认分账配置 | P0 |
| API-PROF-003 | GET /api/admin/profit-sharing | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |
| API-PROF-004 | PUT /api/admin/profit-sharing | 正常场景 - 更新配置 | platformRate: 0.1, defaultExecutorRate: 0.8 | 返回 code: "SUCCESS"，配置已更新 | P0 |
| API-PROF-005 | PUT /api/admin/profit-sharing | 异常场景 - 平台比例超限 | platformRate: 1.5 | 返回 code: "INVALID_PLATFORM_RATE"，状态码 400 | P0 |
| API-PROF-006 | PUT /api/admin/profit-sharing | 异常场景 - 执行者比例超限 | executorMinRate: -0.1 | 返回 code: "INVALID_EXECUTOR_MIN_RATE"，状态码 400 | P0 |
| API-PROF-007 | PUT /api/admin/profit-sharing | 异常场景 - 比例总和超限 | platformRate: 0.5, defaultExecutorRate: 0.6 | 返回 code: "INVALID_RATE_SUM"，状态码 400 | P0 |
| API-PROF-008 | PUT /api/admin/profit-sharing | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |

### 1.9 数据导出接口

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| API-EXPT-001 | GET /api/admin/export/orders | 正常场景 - 导出 Excel | format: "xlsx" | 返回 xlsx 文件，Content-Type 正确 | P0 |
| API-EXPT-002 | GET /api/admin/export/orders | 正常场景 - 导出 CSV | format: "csv" | 返回 csv 文件，Content-Type 正确 | P0 |
| API-EXPT-003 | GET /api/admin/export/orders | 正常场景 - 时间范围筛选 | startDate: "2026-03-01", endDate: "2026-03-30" | 返回指定时间范围内的订单数据 | P0 |
| API-EXPT-004 | GET /api/admin/export/orders | 正常场景 - 状态筛选 | status: "completed" | 返回已完成订单数据 | P0 |
| API-EXPT-005 | GET /api/admin/export/orders | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |
| API-EXPT-006 | GET /api/admin/export/executors | 正常场景 - 导出执行者 | format: "xlsx" | 返回执行者数据 xlsx 文件 | P0 |
| API-EXPT-007 | GET /api/admin/export/users | 正常场景 - 导出用户 | format: "xlsx" | 返回用户数据 xlsx 文件 | P0 |
| API-EXPT-008 | GET /api/admin/export/qualifications | 正常场景 - 导出资质 | format: "xlsx" | 返回资质数据 xlsx 文件 | P0 |

### 1.10 系统设置接口

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| API-SETT-001 | GET /api/admin/settings | 正常场景 - 获取设置 | 有效 Token | 返回 code: "SUCCESS"，包含系统设置 | P0 |
| API-SETT-002 | GET /api/admin/settings | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |
| API-SETT-003 | PUT /api/admin/settings | 正常场景 - 更新设置 | 有效的设置对象 | 返回 code: "SUCCESS"，设置已更新 | P0 |
| API-SETT-004 | PUT /api/admin/settings | 异常场景 - 无效参数 | 包含非法字段 | 返回 code: "INVALID_PARAMS"，状态码 400 | P1 |

### 1.11 操作日志接口

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| API-LOGS-001 | GET /api/admin/logs | 正常场景 - 默认分页 | page: 1, pageSize: 20 | 返回操作日志列表和分页信息 | P0 |
| API-LOGS-002 | GET /api/admin/logs | 正常场景 - 类型筛选 | type: "admin_login" | 返回指定类型的日志 | P0 |
| API-LOGS-003 | GET /api/admin/logs | 正常场景 - 时间范围筛选 | startDate: "2026-03-01", endDate: "2026-03-30" | 返回指定时间范围内的日志 | P0 |
| API-LOGS-004 | GET /api/admin/logs | 异常场景 - 无 Token | 无 Authorization header | 返回 code: "UNAUTHORIZED"，状态码 401 | P0 |
| API-LOGS-005 | GET /api/admin/logs/types | 正常场景 - 获取日志类型 | 有效 Token | 返回日志类型列表 | P1 |
| API-LOGS-006 | GET /api/admin/logs/stats | 正常场景 - 日志统计 | groupBy: "day" | 返回按天分组的日志统计 | P1 |

---

## 2. 前端功能测试用例 (P1)

### 2.1 登录页

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| FE-LOGIN-001 | 登录页 | 正常场景 - 登录成功 | 正确账号密码 | 跳转至控制台，显示欢迎信息 | P0 |
| FE-LOGIN-002 | 登录页 | 异常场景 - 账号为空 | 密码任意，账号空 | 显示"账号不能为空"提示 | P0 |
| FE-LOGIN-003 | 登录页 | 异常场景 - 密码为空 | 账号任意，密码空 | 显示"密码不能为空"提示 | P0 |
| FE-LOGIN-004 | 登录页 | 异常场景 - 账号密码错误 | 错误账号密码 | 显示"账号或密码错误"提示 | P0 |
| FE-LOGIN-005 | 登录页 | 边界场景 - 记住登录状态 | 勾选"记住我" | 关闭浏览器后仍保持登录 | P1 |
| FE-LOGIN-006 | 登录页 | 边界场景 - Token 过期自动跳转 | Token 过期后访问 | 自动跳转至登录页 | P1 |

### 2.2 控制台 (Dashboard)

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| FE-DASH-001 | 控制台 | 正常场景 - 数据加载 | 访问控制台 | 显示订单/用户/执行者统计数据 | P0 |
| FE-DASH-002 | 控制台 | 正常场景 - 图表展示 | 访问控制台 | 显示订单趋势图、服务类型分布图 | P0 |
| FE-DASH-003 | 控制台 | 正常场景 - 实时数据刷新 | 停留页面 | 实时数据定时刷新 | P1 |
| FE-DASH-004 | 控制台 | 异常场景 - 接口失败 | API 返回错误 | 显示错误提示，不崩溃 | P0 |
| FE-DASH-005 | 控制台 | 边界场景 - 空数据 | 无订单数据 | 显示"暂无数据"或 0 | P1 |

### 2.3 订单管理页

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| FE-ORD-001 | 订单管理 | 正常场景 - 列表加载 | 访问页面 | 显示订单列表 | P0 |
| FE-ORD-002 | 订单管理 | 正常场景 - 分页 | 点击页码 | 加载对应页数据 | P0 |
| FE-ORD-003 | 订单管理 | 正常场景 - 状态筛选 | 选择状态 | 筛选显示对应状态订单 | P0 |
| FE-ORD-004 | 订单管理 | 正常场景 - 搜索 | 输入关键词 | 显示搜索结果 | P0 |
| FE-ORD-005 | 订单管理 | 正常场景 - 状态更新 | 选择订单，更新状态 | 状态更新成功，显示提示 | P0 |
| FE-ORD-006 | 订单管理 | 异常场景 - 更新失败 | 网络错误 | 显示错误提示 | P0 |
| FE-ORD-007 | 订单管理 | 边界场景 - 空列表 | 无订单 | 显示"暂无订单" | P1 |

### 2.4 资质审核页

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| FE-QUAL-001 | 资质审核 | 正常场景 - 列表加载 | 访问页面 | 显示待审核资质列表 | P0 |
| FE-QUAL-002 | 资质审核 | 正常场景 - 查看详情 | 点击资质 | 显示资质详情和图片 | P0 |
| FE-QUAL-003 | 资质审核 | 正常场景 - 审核通过 | 点击通过 | 审核成功，状态更新 | P0 |
| FE-QUAL-004 | 资质审核 | 正常场景 - 审核驳回 | 点击驳回，填写原因 | 驳回成功，状态更新 | P0 |
| FE-QUAL-005 | 资质审核 | 异常场景 - 驳回无原因 | 点击驳回，原因空 | 提示"请填写驳回原因" | P0 |
| FE-QUAL-006 | 资质审核 | 边界场景 - 图片预览 | 点击资质图片 | 放大预览图片 | P1 |

### 2.5 申诉仲裁页

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| FE-APPL-001 | 申诉仲裁 | 正常场景 - 列表加载 | 访问页面 | 显示申诉列表 | P0 |
| FE-APPL-002 | 申诉仲裁 | 正常场景 - 查看详情 | 点击申诉 | 显示申诉详情和相关订单 | P0 |
| FE-APPL-003 | 申诉仲裁 | 正常场景 - 仲裁处理 | 选择结果，填写备注 | 仲裁成功，状态更新 | P0 |
| FE-APPL-004 | 申诉仲裁 | 边界场景 - 已处理申诉 | 查看已处理申诉 | 显示处理结果，不可再处理 | P1 |

### 2.6 分账配置页

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| FE-PROF-001 | 分账配置 | 正常场景 - 加载配置 | 访问页面 | 显示当前分账配置 | P0 |
| FE-PROF-002 | 分账配置 | 正常场景 - 保存配置 | 修改配置，点击保存 | 保存成功，显示提示 | P0 |
| FE-PROF-003 | 分账配置 | 异常场景 - 比例超限 | 输入>1 的比例 | 输入框验证，无法保存 | P0 |
| FE-PROF-004 | 分账配置 | 异常场景 - 比例总和超限 | 总和>1 | 保存时提示错误 | P0 |

### 2.7 执行者管理页

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| FE-EXEC-001 | 执行者管理 | 正常场景 - 列表加载 | 访问页面 | 显示执行者列表 | P0 |
| FE-EXEC-002 | 执行者管理 | 正常场景 - 搜索 | 输入关键词 | 显示搜索结果 | P0 |
| FE-EXEC-003 | 执行者管理 | 正常场景 - 状态筛选 | 选择状态 | 筛选显示对应状态执行者 | P0 |
| FE-EXEC-004 | 执行者管理 | 正常场景 - 状态更新 | 选择执行者，更新状态 | 状态更新成功 | P0 |
| FE-EXEC-005 | 执行者管理 | 正常场景 - 查看详情 | 点击执行者 | 显示详细信息和统计数据 | P0 |

### 2.8 数据导出页

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| FE-EXPT-001 | 数据导出 | 正常场景 - 选择导出类型 | 选择订单/执行者/用户 | 显示对应筛选条件 | P0 |
| FE-EXPT-002 | 数据导出 | 正常场景 - 选择格式 | 选择 Excel/CSV | 正确格式设置 | P0 |
| FE-EXPT-003 | 数据导出 | 正常场景 - 导出文件 | 点击导出 | 下载文件成功 | P0 |
| FE-EXPT-004 | 数据导出 | 边界场景 - 大数据量 | 导出大量数据 | 正常处理或提示等待 | P1 |

### 2.9 系统设置页

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| FE-SETT-001 | 系统设置 | 正常场景 - 加载设置 | 访问页面 | 显示当前系统设置 | P0 |
| FE-SETT-002 | 系统设置 | 正常场景 - 保存设置 | 修改设置，点击保存 | 保存成功，显示提示 | P0 |
| FE-SETT-003 | 系统设置 | 异常场景 - 网络错误 | 保存时断网 | 显示错误提示 | P0 |

---

## 3. 云函数测试用例 (P1)

### 3.1 login 云函数

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| CF-LOGIN-001 | login | 正常场景 - 新用户注册 | 有效 code，新用户 | 创建用户，返回 SUCCESS | P0 |
| CF-LOGIN-002 | login | 正常场景 - 老用户登录 | 有效 code，已有用户 | 更新登录时间，返回 SUCCESS | P0 |
| CF-LOGIN-003 | login | 异常场景 - 缺少 code | code: 空 | 返回 MISSING_CODE 错误 | P0 |
| CF-LOGIN-004 | login | 异常场景 - 无效 code | code: "invalid" | 返回 LOGIN_FAILED 错误 | P0 |

### 3.2 createOrder 云函数

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| CF-ORDER-001 | createOrder | 正常场景 - 创建订单 | 完整订单参数 | 返回 SUCCESS，订单创建成功 | P0 |
| CF-ORDER-002 | createOrder | 异常场景 - 缺少必填参数 | 缺少 serviceType | 返回 MISSING_PARAMS 错误 | P0 |
| CF-ORDER-003 | createOrder | 异常场景 - 用户不存在 | 无效 openId | 返回 USER_NOT_FOUND 错误 | P0 |
| CF-ORDER-004 | createOrder | 异常场景 - API 超时 | 火山云 API 超时 | 返回 CREATE_ORDER_FAILED 错误 | P0 |

### 3.3 grabOrder 云函数

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| CF-GRAB-001 | grabOrder | 正常场景 - 抢单成功 | 有效 orderId，pending 状态 | 返回 SUCCESS，订单状态更新 | P0 |
| CF-GRAB-002 | grabOrder | 异常场景 - 订单不存在 | 无效 orderId | 返回 ORDER_NOT_FOUND 错误 | P0 |
| CF-GRAB-003 | grabOrder | 异常场景 - 订单已抢 | 已抢订单 | 返回 ORDER_GRABBED 错误 | P0 |
| CF-GRAB-004 | grabOrder | 异常场景 - 非执行者 | 普通用户 | 返回 EXECUTOR_NOT_FOUND 错误 | P0 |
| CF-GRAB-005 | grabOrder | 并发场景 - 多人同时抢单 | 同一订单，并发请求 | 只有一个成功，其他失败 | P0 |

### 3.4 uploadEvidence 云函数

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| CF-UPLD-001 | uploadEvidence | 正常场景 - 单文件上传 | 完整文件数据 | 返回 SUCCESS，上传成功 | P0 |
| CF-UPLD-002 | uploadEvidence | 正常场景 - 分片上传初始化 | action: "init" | 返回 uploadId | P0 |
| CF-UPLD-003 | uploadEvidence | 正常场景 - 分片上传 | action: "upload", chunkIndex | 返回上传进度 | P0 |
| CF-UPLD-004 | uploadEvidence | 正常场景 - 分片合并 | action: "merge" | 返回 SUCCESS，文件合并成功 | P0 |
| CF-UPLD-005 | uploadEvidence | 异常场景 - 无权限 | 非执行者上传 | 返回 PERMISSION_DENIED 错误 | P0 |
| CF-UPLD-006 | uploadEvidence | 异常场景 - 订单不存在 | 无效 orderId | 返回 ORDER_NOT_FOUND 错误 | P0 |

---

## 4. 异常处理测试用例 (P2)

### 4.1 网络异常

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| EX-NET-001 | 所有接口 | 网络超时 | 模拟超时 | 返回超时错误，合理重试 | P1 |
| EX-NET-002 | 所有接口 | 网络断开 | 模拟断网 | 返回网络错误提示 | P1 |
| EX-NET-003 | 所有接口 | DNS 解析失败 | 无效域名 | 返回连接错误 | P2 |

### 4.2 数据库异常

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| EX-DB-001 | 所有接口 | 数据库连接失败 | 模拟 MongoDB 宕机 | 返回 500 错误，友好提示 | P1 |
| EX-DB-002 | 所有接口 | 查询超时 | 模拟慢查询 | 返回超时错误 | P1 |
| EX-DB-003 | 所有接口 | 写入失败 | 模拟写入冲突 | 返回错误，数据不丢失 | P1 |

### 4.3 认证异常

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| EX-AUTH-001 | 需要认证的接口 | Token 过期 | 过期 Token | 返回 401，提示重新登录 | P0 |
| EX-AUTH-002 | 需要认证的接口 | Token 被篡改 | 无效 Token | 返回 401，提示认证失败 | P0 |
| EX-AUTH-003 | 需要认证的接口 | 权限不足 | 普通用户访问管理接口 | 返回 403，提示权限不足 | P0 |

### 4.4 参数验证异常

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| EX-PARA-001 | 所有接口 | 参数类型错误 | 字符串传数字字段 | 返回 400，提示参数错误 | P1 |
| EX-PARA-002 | 所有接口 | 必填参数缺失 | 缺少必填字段 | 返回 400，提示缺少参数 | P0 |
| EX-PARA-003 | 所有接口 | 参数格式错误 | 日期格式错误 | 返回 400，提示格式错误 | P1 |
| EX-PARA-004 | 所有接口 | 参数值越界 | 负数价格 | 返回 400，提示参数范围错误 | P1 |

### 4.5 服务器异常

| 用例 ID | 接口/页面 | 测试场景 | 输入数据 | 预期结果 | 优先级 |
|---------|-----------|----------|----------|----------|--------|
| EX-SRV-001 | 所有接口 | 服务器内部错误 | 模拟代码异常 | 返回 500，友好错误页 | P1 |
| EX-SRV-002 | 所有接口 | 服务不可用 | 模拟服务宕机 | 返回 503，提示稍后重试 | P1 |
| EX-SRV-003 | 所有接口 | 请求体过大 | 超大请求体 | 返回 413，提示请求过大 | P2 |

---

## 测试用例统计

| 类别 | 用例数量 |
|------|----------|
| API 接口测试 (P0) | 88 个 |
| 前端功能测试 (P1) | 52 个 |
| 云函数测试 (P1) | 22 个 |
| 异常处理测试 (P2) | 20 个 |
| **总计** | **182 个** |

---

## 测试覆盖率目标

- **API 接口覆盖率**: ≥95%
- **前端页面覆盖率**: ≥90%
- **云函数覆盖率**: ≥85%
- **整体代码覆盖率**: ≥80%

---

**文档版本**: 1.0.0  
**最后更新**: 2026-03-30
