<template>
  <div class="system-settings">
    <el-tabs v-model="activeTab">
      <!-- 基础配置 -->
      <el-tab-pane label="基础配置" name="base">
        <el-card>
          <el-form :model="baseForm" label-width="150px">
            <el-form-item label="系统名称">
              <el-input v-model="baseForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统 Logo">
              <el-upload
                class="logo-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleLogoSuccess"
              >
                <img v-if="baseForm.logo" :src="baseForm.logo" class="logo" />
                <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="客服电话">
              <el-input v-model="baseForm.customerServicePhone" placeholder="请输入客服电话" />
            </el-form-item>
            <el-form-item label="客服邮箱">
              <el-input v-model="baseForm.customerServiceEmail" placeholder="请输入客服邮箱" />
            </el-form-item>
            <el-form-item label="系统公告">
              <el-input
                v-model="baseForm.announcement"
                type="textarea"
                :rows="4"
                placeholder="请输入系统公告内容"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBaseConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <!-- 权限管理 -->
      <el-tab-pane label="权限管理" name="permission">
        <el-card>
          <el-table :data="roleData" border style="width: 100%">
            <el-table-column prop="name" label="角色名称" width="150" />
            <el-table-column prop="description" label="描述" width="200" />
            <el-table-column label="权限" min-width="300">
              <template #default="{ row }">
                <el-checkbox-group v-model="row.permissions">
                  <el-checkbox label="dashboard">控制台</el-checkbox>
                  <el-checkbox label="order">订单管理</el-checkbox>
                  <el-checkbox label="qualification">资质审核</el-checkbox>
                  <el-checkbox label="appeal">申诉仲裁</el-checkbox>
                  <el-checkbox label="profit">分账配置</el-checkbox>
                  <el-checkbox label="executor">执行者管理</el-checkbox>
                  <el-checkbox label="export">数据导出</el-checkbox>
                  <el-checkbox label="settings">系统设置</el-checkbox>
                </el-checkbox-group>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="editRole(row)">编辑</el-button>
                <el-button type="danger" size="small" @click="deleteRole(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-button type="success" @click="addRole" style="margin-top: 20px;">
            <el-icon><Plus /></el-icon>
            添加角色
          </el-button>
        </el-card>
      </el-tab-pane>
      
      <!-- 操作日志 -->
      <el-tab-pane label="操作日志" name="logs">
        <el-card>
          <!-- 筛选栏 -->
          <el-form :inline="true" :model="logFilterForm" class="filter-form">
            <el-form-item label="操作人">
              <el-input v-model="logFilterForm.operator" placeholder="请输入操作人" clearable />
            </el-form-item>
            <el-form-item label="操作类型">
              <el-select v-model="logFilterForm.type" placeholder="请选择类型" clearable>
                <el-option label="登录" value="login" />
                <el-option label="创建" value="create" />
                <el-option label="修改" value="update" />
                <el-option label="删除" value="delete" />
                <el-option label="导出" value="export" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="logFilterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadLogs">查询</el-button>
            </el-form-item>
          </el-form>
          
          <el-table :data="logData" border stripe style="width: 100%">
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="type" label="操作类型" width="100">
              <template #default="{ row }">
                <el-tag>{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="module" label="模块" width="120" />
            <el-table-column prop="action" label="操作" width="150" />
            <el-table-column prop="ip" label="IP 地址" width="140" />
            <el-table-column prop="time" label="操作时间" width="160" />
            <el-table-column prop="result" label="结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.result === '成功' ? 'success' : 'danger'">
                  {{ row.result }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          
          <el-pagination
            v-model:current-page="logPagination.page"
            v-model:page-size="logPagination.pageSize"
            :total="logPagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleLogSizeChange"
            @current-change="handleLogPageChange"
            style="margin-top: 20px; justify-content: flex-end;"
          />
        </el-card>
      </el-tab-pane>
      
      <!-- 系统信息 -->
      <el-tab-pane label="系统信息" name="system">
        <el-card>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统名称">{{ systemInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="版本号">{{ systemInfo.version }}</el-descriptions-item>
            <el-descriptions-item label="框架版本">{{ systemInfo.frameworkVersion }}</el-descriptions-item>
            <el-descriptions-item label="数据库版本">{{ systemInfo.databaseVersion }}</el-descriptions-item>
            <el-descriptions-item label="服务器环境">{{ systemInfo.serverEnv }}</el-descriptions-item>
            <el-descriptions-item label="服务器时间">{{ systemInfo.serverTime }}</el-descriptions-item>
            <el-descriptions-item label="运行时间" :span="2">{{ systemInfo.uptime }}</el-descriptions-item>
            <el-descriptions-item label="CPU 使用率" :span="2">
              <el-progress :percentage="systemInfo.cpuUsage" :color="getProgressColor(systemInfo.cpuUsage)" />
            </el-descriptions-item>
            <el-descriptions-item label="内存使用率" :span="2">
              <el-progress :percentage="systemInfo.memoryUsage" :color="getProgressColor(systemInfo.memoryUsage)" />
            </el-descriptions-item>
            <el-descriptions-item label="磁盘使用率" :span="2">
              <el-progress :percentage="systemInfo.diskUsage" :color="getProgressColor(systemInfo.diskUsage)" />
            </el-descriptions-item>
          </el-descriptions>
          
          <el-button type="primary" @click="refreshSystemInfo" style="margin-top: 20px;">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getBaseConfig,
  updateBaseConfig,
  getPermissionConfig,
  updatePermissionConfig,
  getOperationLogs,
  getSystemInfo
} from '@/api/settings'

const activeTab = ref('base')

const baseForm = reactive({
  systemName: '清如 ClearSpring 管理后台',
  logo: '',
  customerServicePhone: '400-123-4567',
  customerServiceEmail: 'support@clearspring.com',
  announcement: '系统将于今晚 23:00 进行例行维护，预计耗时 1 小时。'
})

const roleData = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有所有权限',
    permissions: ['dashboard', 'order', 'qualification', 'appeal', 'profit', 'executor', 'export', 'settings']
  },
  {
    id: 2,
    name: '运营人员',
    description: '负责日常运营',
    permissions: ['dashboard', 'order', 'qualification', 'executor', 'export']
  },
  {
    id: 3,
    name: '客服人员',
    description: '负责客服工作',
    permissions: ['dashboard', 'order', 'appeal']
  }
])

const logFilterForm = reactive({
  operator: '',
  type: '',
  dateRange: []
})

const logData = ref([
  {
    id: 1,
    operator: '管理员 A',
    type: 'login',
    module: '系统',
    action: '登录系统',
    ip: '192.168.1.100',
    time: '2026-03-30 10:30:00',
    result: '成功'
  },
  {
    id: 2,
    operator: '管理员 B',
    type: 'update',
    module: '订单',
    action: '更新订单状态',
    ip: '192.168.1.101',
    time: '2026-03-30 09:15:00',
    result: '成功'
  }
])

const logPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 2
})

const systemInfo = reactive({
  name: '清如 ClearSpring 管理后台',
  version: 'v1.0.0',
  frameworkVersion: 'Vue 3.3 + Element Plus 2.4',
  databaseVersion: 'MySQL 8.0',
  serverEnv: 'Production',
  serverTime: '2026-03-30 12:00:00',
  uptime: '15 天 8 小时 30 分钟',
  cpuUsage: 35,
  memoryUsage: 62,
  diskUsage: 48
})

const handleLogoSuccess = (response) => {
  baseForm.logo = response.url
  ElMessage.success('Logo 上传成功')
}

const saveBaseConfig = async () => {
  try {
    await updateBaseConfig(baseForm)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const editRole = (row) => {
  ElMessage.info(`编辑角色：${row.name}`)
}

const deleteRole = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const addRole = () => {
  ElMessage.info('添加角色功能')
}

const loadLogs = async () => {
  try {
    // 加载日志数据
  } catch (error) {
    console.error('加载日志失败:', error)
  }
}

const handleLogSizeChange = () => {
  loadLogs()
}

const handleLogPageChange = () => {
  loadLogs()
}

const getProgressColor = (percentage) => {
  if (percentage < 50) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

const refreshSystemInfo = async () => {
  try {
    // 刷新系统信息
    systemInfo.serverTime = new Date().toLocaleString('zh-CN')
    ElMessage.success('刷新成功')
  } catch (error) {
    console.error('刷新失败:', error)
  }
}

const loadConfig = async () => {
  try {
    // 加载配置数据
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

onMounted(() => {
  loadConfig()
  systemInfo.serverTime = new Date().toLocaleString('zh-CN')
})
</script>

<style scoped>
.system-settings {
  padding: 0;
}

.filter-form {
  margin-bottom: 20px;
}

.logo-uploader .logo {
  width: 178px;
  height: 178px;
  display: block;
  border-radius: 4px;
  object-fit: cover;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}
</style>
