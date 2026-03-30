<template>
  <div class="executor-manage">
    <el-card>
      <!-- 筛选栏 -->
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="执行者姓名">
          <el-input v-model="filterForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="filterForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="激活" value="active" />
            <el-option label="禁用" value="disabled" />
            <el-option label="封禁" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务类型">
          <el-select v-model="filterForm.serviceType" placeholder="请选择服务类型" clearable>
            <el-option label="保洁" value="cleaning" />
            <el-option label="维修" value="repair" />
            <el-option label="搬家" value="moving" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="serviceTypes" label="服务类型" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="type in row.serviceTypes"
              :key="type"
              size="small"
              style="margin-right: 5px;"
            >
              {{ type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="100">
          <template #default="{ row }">
            <div class="rating">
              <el-rate v-model="row.rating" disabled show-score text-color="#ff9900" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="160" />
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'active'"
              type="warning"
              size="small"
              @click="handleDisable(row)"
            >
              禁用
            </el-button>
            <el-button
              v-if="row.status === 'disabled'"
              type="success"
              size="small"
              @click="handleActivate(row)"
            >
              激活
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleBan(row)"
            >
              封禁
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="dialogVisible" title="执行者详情" width="700px">
      <el-descriptions :column="2" border v-if="currentExecutor">
        <el-descriptions-item label="姓名">{{ currentExecutor.name }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentExecutor.phone }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ currentExecutor.idCard }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentExecutor.registerTime }}</el-descriptions-item>
        <el-descriptions-item label="服务类型" :span="2">
          <el-tag
            v-for="type in currentExecutor.serviceTypes"
            :key="type"
            style="margin-right: 5px;"
          >
            {{ type }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="评分">
          <el-rate v-model="currentExecutor.rating" disabled show-score text-color="#ff9900" />
        </el-descriptions-item>
        <el-descriptions-item label="订单数">{{ currentExecutor.orderCount }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="getStatusType(currentExecutor.status)">
            {{ getStatusLabel(currentExecutor.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="个人简介" :span="2">
          {{ currentExecutor.bio || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <el-divider>资质证书</el-divider>
      <div class="certificate-images">
        <el-image
          v-for="(img, index) in currentExecutor?.certificates"
          :key="index"
          :src="img"
          :preview-src-list="[img]"
          class="certificate-image"
          fit="cover"
        />
      </div>
    </el-dialog>
    
    <!-- 封禁对话框 -->
    <el-dialog v-model="banDialogVisible" title="封禁执行者" width="500px">
      <el-form :model="banForm" label-width="80px">
        <el-form-item label="封禁原因" required>
          <el-input
            v-model="banForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明封禁原因"
          />
        </el-form-item>
        <el-form-item label="封禁时长">
          <el-select v-model="banForm.duration" placeholder="请选择封禁时长" style="width: 100%;">
            <el-option label="7 天" :value="7" />
            <el-option label="15 天" :value="15" />
            <el-option label="30 天" :value="30" />
            <el-option label="永久封禁" :value="999" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="banDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmBan">确认封禁</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExecutorList, updateExecutorStatus, banExecutor } from '@/api/executor'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const banDialogVisible = ref(false)
const currentExecutor = ref(null)

const filterForm = reactive({
  name: '',
  phone: '',
  status: '',
  serviceType: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const banForm = reactive({
  executorId: '',
  reason: '',
  duration: 30
})

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '张三',
    phone: '138****1234',
    idCard: '11010119900101XXXX',
    serviceTypes: ['保洁', '维修'],
    rating: 4.8,
    orderCount: 156,
    status: 'active',
    registerTime: '2025-12-15 10:30:00',
    bio: '5 年家政服务经验，认真负责',
    certificates: [
      'https://via.placeholder.com/300x200?text=Certificate+1',
      'https://via.placeholder.com/300x200?text=Certificate+2'
    ]
  },
  {
    id: 2,
    name: '李四',
    phone: '139****5678',
    idCard: '11010119920202XXXX',
    serviceTypes: ['搬家'],
    rating: 4.5,
    orderCount: 89,
    status: 'active',
    registerTime: '2026-01-20 14:20:00',
    bio: '专业搬家服务，效率高',
    certificates: []
  }
]

const getStatusType = (status) => {
  const types = {
    active: 'success',
    disabled: 'warning',
    banned: 'danger'
  }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    active: '激活',
    disabled: '禁用',
    banned: '封禁'
  }
  return labels[status] || status
}

const loadData = async () => {
  loading.value = true
  try {
    tableData.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  filterForm.name = ''
  filterForm.phone = ''
  filterForm.status = ''
  filterForm.serviceType = ''
  handleSearch()
}

const handleView = (row) => {
  currentExecutor.value = row
  dialogVisible.value = true
}

const handleDisable = async (row) => {
  try {
    await ElMessageBox.confirm('确定要禁用该执行者吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await updateExecutorStatus(row.id, { status: 'disabled' })
    ElMessage.success('禁用成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('禁用失败:', error)
    }
  }
}

const handleActivate = async (row) => {
  try {
    await updateExecutorStatus(row.id, { status: 'active' })
    ElMessage.success('激活成功')
    loadData()
  } catch (error) {
    console.error('激活失败:', error)
  }
}

const handleBan = (row) => {
  currentExecutor.value = row
  banForm.executorId = row.id
  banForm.reason = ''
  banForm.duration = 30
  banDialogVisible.value = true
}

const confirmBan = async () => {
  if (!banForm.reason.trim()) {
    ElMessage.warning('请填写封禁原因')
    return
  }
  
  try {
    await banExecutor(banForm.executorId, {
      reason: banForm.reason,
      duration: banForm.duration
    })
    ElMessage.success('封禁成功')
    banDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('封禁失败:', error)
  }
}

const handleSizeChange = () => {
  loadData()
}

const handlePageChange = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.executor-manage {
  padding: 0;
}

.filter-form {
  margin-bottom: 20px;
}

.rating {
  display: flex;
  align-items: center;
}

.certificate-images {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin: 15px 0;
}

.certificate-image {
  width: 200px;
  height: 150px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
