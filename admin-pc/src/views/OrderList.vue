<template>
  <div class="order-list">
    <el-card>
      <!-- 筛选栏 -->
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="订单号">
          <el-input v-model="filterForm.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="待接单" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务类型">
          <el-select v-model="filterForm.serviceType" placeholder="请选择服务类型" clearable>
            <el-option label="保洁" value="cleaning" />
            <el-option label="维修" value="repair" />
            <el-option label="搬家" value="moving" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
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
        <el-table-column prop="orderNo" label="订单号" width="120" />
        <el-table-column prop="customerName" label="客户" width="100" />
        <el-table-column prop="serviceType" label="服务类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.serviceType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="executorName" label="执行者" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              详情
            </el-button>
            <el-button type="warning" size="small" @click="handleUpdateStatus(row)">
              更新状态
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
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
    <el-dialog v-model="dialogVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder.status)">
            {{ getStatusLabel(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户">{{ currentOrder.customerName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder.customerPhone }}</el-descriptions-item>
        <el-descriptions-item label="服务类型">{{ currentOrder.serviceType }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ currentOrder.amount }}</el-descriptions-item>
        <el-descriptions-item label="执行者" :span="2">{{ currentOrder.executorName || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="服务地址" :span="2">{{ currentOrder.address }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    
    <!-- 更新状态对话框 -->
    <el-dialog v-model="statusDialogVisible" title="更新订单状态" width="400px">
      <el-form :model="statusForm">
        <el-form-item label="订单状态">
          <el-select v-model="statusForm.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="待接单" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdateStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, getOrderDetail, updateOrderStatus, deleteOrder } from '@/api/order'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const statusDialogVisible = ref(false)
const currentOrder = ref(null)

const filterForm = reactive({
  orderNo: '',
  status: '',
  serviceType: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const statusForm = reactive({
  orderId: '',
  status: ''
})

// 模拟数据
const mockData = [
  {
    orderNo: 'ORD20260330001',
    customerName: '张三',
    customerPhone: '138****1234',
    serviceType: '保洁',
    amount: 158,
    status: 'pending',
    executorName: '李四',
    address: '北京市朝阳区 XX 小区 1-1-101',
    remark: '需要自带清洁工具',
    createTime: '2026-03-30 10:30:00'
  },
  {
    orderNo: 'ORD20260330002',
    customerName: '王五',
    customerPhone: '139****5678',
    serviceType: '维修',
    amount: 280,
    status: 'in_progress',
    executorName: '赵六',
    address: '北京市海淀区 XX 大厦 B 座 502',
    remark: '',
    createTime: '2026-03-30 09:15:00'
  }
]

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待接单',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[status] || status
}

const loadData = async () => {
  loading.value = true
  try {
    // 使用模拟数据
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
  filterForm.orderNo = ''
  filterForm.status = ''
  filterForm.serviceType = ''
  filterForm.dateRange = []
  handleSearch()
}

const handleView = async (row) => {
  currentOrder.value = row
  dialogVisible.value = true
}

const handleUpdateStatus = (row) => {
  statusForm.orderId = row.orderNo
  statusForm.status = row.status
  statusDialogVisible.value = true
}

const confirmUpdateStatus = async () => {
  try {
    await updateOrderStatus(statusForm.orderId, { status: statusForm.status })
    ElMessage.success('状态更新成功')
    statusDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteOrder(row.orderNo)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
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
.order-list {
  padding: 0;
}

.filter-form {
  margin-bottom: 20px;
}
</style>
