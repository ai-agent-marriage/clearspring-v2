# 清如 ClearSpring V2 - 管理端 API 快速参考

## 基础信息

- **Base URL:** `http://101.96.192.63:3000` (生产) 或 `http://localhost:3000` (开发)
- **认证:** JWT Bearer Token
- **权限:** 所有接口需要 `admin` 角色

---

## 接口速查表

### 订单管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/orders` | 订单列表（分页/筛选） | admin |
| PUT | `/api/admin/order/:id/status` | 更新订单状态 | admin |
| DELETE | `/api/admin/order/:id` | 删除订单 | admin |

### 资质审核

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/qualifications` | 资质审核列表 | admin |
| PUT | `/api/admin/qualification/:id` | 审核通过/驳回 | admin |

### 执行者管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/executors` | 执行者列表 | admin |
| PUT | `/api/admin/executor/:id/status` | 更新执行者状态 | admin |

### 分账配置

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/profit-sharing` | 获取分账配置 | admin |
| PUT | `/api/admin/profit-sharing` | 更新分账配置 | admin |

---

## 快速测试

### cURL 示例

```bash
# 设置环境变量
export API_URL="http://localhost:3000"
export ADMIN_TOKEN="your_admin_token"

# 1. 获取订单列表
curl -X GET "$API_URL/api/admin/orders?page=1&pageSize=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. 更新订单状态
curl -X PUT "$API_URL/api/admin/order/ORDER_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","remark":"测试"}'

# 3. 获取资质列表
curl -X GET "$API_URL/api/admin/qualifications?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. 审核资质
curl -X PUT "$API_URL/api/admin/qualification/QUAL_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","auditRemark":"通过"}'

# 5. 获取执行者列表
curl -X GET "$API_URL/api/admin/executors?status=active" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 6. 更新执行者状态
curl -X PUT "$API_URL/api/admin/executor/EXEC_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive","remark":"测试"}'

# 7. 获取分账配置
curl -X GET "$API_URL/api/admin/profit-sharing" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 8. 更新分账配置
curl -X PUT "$API_URL/api/admin/profit-sharing" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"platformRate":0.10,"executorMinRate":0.70,"executorMaxRate":0.90}'
```

---

## 常见错误码

| 错误码 | HTTP 状态 | 说明 |
|--------|----------|------|
| SUCCESS | 200 | 成功 |
| UNAUTHORIZED | 401 | 未授权 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| INVALID_STATUS | 400 | 无效状态 |
| ORDER_CANNOT_DELETE | 400 | 订单无法删除 |
| MISSING_REJECT_REASON | 400 | 缺少驳回原因 |
| INVALID_PLATFORM_RATE | 400 | 无效的平台抽成比例 |

---

## 测试工具

### Postman
导入集合：`tests/integration/postman-collection.json`

### 自动化测试
```bash
cd /root/.openclaw/workspace/projects/clearspring-v2
export ADMIN_TOKEN="your_token"
./tests/integration/run-tests.sh
```

---

## 相关文档

- **完整 API 文档:** `api/admin/README.md`
- **测试报告:** `tests/integration/test-report.md`
- **完成报告:** `COMPLETION_REPORT.md`

---

**更新时间:** 2026-03-30  
**版本:** 2.0.0
