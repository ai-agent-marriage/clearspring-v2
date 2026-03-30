# ClearSpring PC 管理后台 - API 封装清单

## 📦 依赖安装

✅ **Axios** - HTTP 客户端库
```bash
npm install axios --save
```

✅ **NProgress** - 页面加载进度条
```bash
npm install nprogress --save
```

---

## 📁 文件结构

```
admin-pc/src/api/
├── request.js          # Axios 统一封装（请求/响应拦截器）
├── auth.js            # 认证模块
├── dashboard.js       # 数据统计模块
├── order.js           # 订单管理模块
├── qualification.js   # 资质审核模块
├── appeal.js          # 申诉管理模块
├── executor.js        # 执行者管理模块
├── profit.js          # 分账管理模块
├── export.js          # 数据导出模块
├── admin.js           # 管理员管理模块
└── log.js             # 日志管理模块
```

---

## 🔧 核心封装 (request.js)

### 基础配置
- **baseURL**: `/api`
- **timeout**: 10000ms (10 秒)

### 请求拦截器
- ✅ 自动添加 NProgress 加载进度条
- ✅ 自动从 localStorage 读取 `admin_token`
- ✅ 自动注入 `Authorization: Bearer {token}` 请求头

### 响应拦截器
- ✅ 完成时关闭 NProgress 进度条
- ✅ 统一返回 `response.data`（无需二次解析）
- ✅ 错误统一提示（ElMessage.error）
- ✅ 401 自动跳转登录页并清除 token

---

## 📋 API 模块清单

### 1. auth.js - 认证模块
| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `login(data)` | POST | `/admin/login` | 管理员登录 |
| `getInfo()` | GET | `/admin/info` | 获取当前管理员信息 |
| `logout()` | POST | `/admin/logout` | 退出登录 |

### 2. dashboard.js - 数据统计模块
| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `getDashboardStats()` | GET | `/dashboard/stats` | 获取统计数据 |
| `getDashboardOverview()` | GET | `/dashboard/overview` | 获取概览数据 |
| `getDashboardCharts()` | GET | `/dashboard/charts` | 获取图表数据 |

### 3. order.js - 订单管理模块
| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `getOrderList(params)` | GET | `/order/list` | 订单列表（分页/筛选） |
| `getOrderDetail(id)` | GET | `/order/{id}` | 订单详情 |
| `updateOrderStatus(id, data)` | PUT | `/order/{id}/status` | 更新订单状态 |
| `deleteOrder(id)` | DELETE | `/order/{id}` | 删除订单 |

### 4. qualification.js - 资质审核模块
| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `getQualificationList(params)` | GET | `/qualification/list` | 资质列表 |
| `getQualificationDetail(id)` | GET | `/qualification/{id}` | 资质详情 |
| `reviewQualification(id, data)` | POST | `/qualification/{id}/review` | 审核资质 |
| `approveQualification(id)` | POST | `/qualification/{id}/approve` | 通过资质 |
| `rejectQualification(id, data)` | POST | `/qualification/{id}/reject` | 拒绝资质 |

### 5. appeal.js - 申诉管理模块
| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `getAppealList(params)` | GET | `/appeal/list` | 申诉列表 |
| `getAppealDetail(id)` | GET | `/appeal/{id}` | 申诉详情 |
| `handleAppeal(id, data)` | POST | `/appeal/{id}/handle` | 处理申诉 |
| `resolveAppeal(id)` | POST | `/appeal/{id}/resolve` | 解决申诉 |

### 6. executor.js - 执行者管理模块
| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `getExecutorList(params)` | GET | `/executor/list` | 执行者列表 |
| `getExecutorDetail(id)` | GET | `/executor/{id}` | 执行者详情 |
| `createExecutor(data)` | POST | `/executor` | 创建执行者 |
| `updateExecutor(id, data)` | PUT | `/executor/{id}` | 更新执行者 |
| `deleteExecutor(id)` | DELETE | `/executor/{id}` | 删除执行者 |
| `toggleExecutorStatus(id)` | POST | `/executor/{id}/toggle` | 切换状态 |

### 7. profit.js - 分账管理模块
| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `getProfitList(params)` | GET | `/profit/list` | 分账记录列表 |
| `getProfitDetail(id)` | GET | `/profit/{id}` | 分账详情 |
| `getProfitSummary(params)` | GET | `/profit/summary` | 分账汇总 |
| `distributeProfit(id, data)` | POST | `/profit/{id}/distribute` | 执行分账 |
| `getProfitRecords(executorId, params)` | GET | `/profit/executor/{id}/records` | 执行者分账记录 |

### 8. export.js - 数据导出模块
| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `exportOrderList(params)` | GET | `/export/orders` | 导出订单（blob） |
| `exportQualificationList(params)` | GET | `/export/qualifications` | 导出资质（blob） |
| `exportExecutorList(params)` | GET | `/export/executors` | 导出执行者（blob） |
| `exportProfitRecords(params)` | GET | `/export/profit` | 导出分账记录（blob） |

### 9. admin.js - 管理员管理模块
| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `getAdminList(params)` | GET | `/admin/list` | 管理员列表 |
| `getAdminDetail(id)` | GET | `/admin/{id}` | 管理员详情 |
| `createAdmin(data)` | POST | `/admin` | 创建管理员 |
| `updateAdmin(id, data)` | PUT | `/admin/{id}` | 更新管理员 |
| `deleteAdmin(id)` | DELETE | `/admin/{id}` | 删除管理员 |
| `updateAdminRole(id, data)` | PUT | `/admin/{id}/role` | 更新角色 |
| `resetAdminPassword(id)` | POST | `/admin/{id}/reset-password` | 重置密码 |

### 10. log.js - 日志管理模块
| 函数名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| `getLogList(params)` | GET | `/log/list` | 日志列表 |
| `getLogDetail(id)` | GET | `/log/{id}` | 日志详情 |
| `getOperationLogs(params)` | GET | `/log/operations` | 操作日志 |
| `getLoginLogs(params)` | GET | `/log/logins` | 登录日志 |
| `getErrorLogs(params)` | GET | `/log/errors` | 错误日志 |
| `exportLogs(params)` | GET | `/log/export` | 导出日志（blob） |

---

## ✅ 验收标准

- [x] Axios 安装成功
- [x] NProgress 安装成功
- [x] 请求拦截器配置正确（Token 注入、进度条）
- [x] 响应拦截器配置正确（错误处理、401 跳转）
- [x] 10 个 API 模块完整创建
- [x] 所有模块统一导入 `./request`
- [x] Git 提交成功

---

## 📝 使用说明

### 在组件中使用

```javascript
// 导入需要的 API 函数
import { login, getInfo } from '@/api/auth'
import { getOrderList } from '@/api/order'

// 调用 API
const handleLogin = async () => {
  try {
    const res = await login({ username, password })
    // res 已经是 response.data，无需 res.data
    console.log('登录成功', res)
  } catch (error) {
    // 错误已被统一处理
    console.error(error)
  }
}
```

### 导出文件处理

```javascript
import { exportOrderList } from '@/api/export'

const handleExport = async () => {
  const blob = await exportOrderList({ status: 1 })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'orders.xlsx'
  link.click()
  window.URL.revokeObjectURL(url)
}
```

---

## 🎯 下一步

1. 在 Vue 组件中导入并使用这些 API
2. 配合 Vuex/Pinia 进行状态管理
3. 根据实际后端接口调整 URL 和参数

---

**生成时间**: 2026-03-30  
**Git Commit**: `fix(P0-04): 完成 Axios API 封装（10 个模块）`
