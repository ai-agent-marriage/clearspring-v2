<template>
  <div class="appeal-arbitration">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="申诉列表" name="appeal">
        <el-card>
          <!-- 筛选栏 -->
          <el-form :inline="true" :model="filterForm" class="filter-form">
            <el-form-item label="申诉人">
              <el-input v-model="filterForm.appellant" placeholder="请输入申诉人" clearable />
            </el-form-item>
            <el-form-item label="申诉类型">
              <el-select v-model="filterForm.type" placeholder="请选择类型" clearable>
                <el-option label="订单纠纷" value="order_dispute" />
                <el-option label="费用异议" value="fee_dispute" />
                <el-option label="服务投诉" value="service_complaint" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item label="处理状态">
              <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
                <el-option label="待处理" value="pending" />
                <el-option label="处理中" value="processing" />
                <el-option label="已处理" value="processed" />
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
            <el-table-column prop="appealNo" label="申诉编号" width="140" />
            <el-table-column prop="appellant" label="申诉人" width="100" />
            <el-table-column prop="type" label="申诉类型" width="120" />
            <el-table-column prop="relatedOrder" label="关联订单" width="140" />
            <el-table-column prop="submitTime" label="提交时间" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="180">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleView(row)">
                  详情
                </el-button>
                <el-button
                  v-if="row.status === 'pending'"
                  type="warning"
                  size="small"
                  @click="handleArbitrate(row)"
                >
                  仲裁
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
      </el-tab-pane>
      
      <el-tab-pane label="仲裁记录" name="record">
        <el-card>
          <el-table :data="recordData" border stripe style="width: 100%">
            <el-table-column prop="recordNo" label="记录编号" width="140" />
            <el-table-column prop="appealNo" label="申诉编号" width="140" />
            <el-table-column prop="arbitrator" label="仲裁员" width="100" />
            <el-table-column prop="result" label="仲裁结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.result === 'support' ? 'success' : 'info'">
                  {{ row.result === 'support' ? '支持申诉' : '驳回申诉' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="arbitrateTime" label="仲裁时间" width="160" />
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="dialogVisible" title="申诉详情" width="800px">
      <el-descriptions :column="2" border v-if="currentAppeal">
        <el-descriptions-item label="申诉编号">{{ currentAppeal.appealNo }}</el-descriptions-item>
        <el-descriptions-item label="申诉人">{{ currentAppeal.appellant }}</el-descriptions-item>
        <el-descriptions-item label="申诉类型">{{ currentAppeal.type }}</el-descriptions-item>
        <el-descriptions-item label="关联订单">{{ currentAppeal.relatedOrder }}</el-descriptions-item>
        <el-descriptions-item label="提交时间" :span="2">{{ currentAppeal.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="getStatusType(currentAppeal.status)">
            {{ getStatusLabel(currentAppeal.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申诉内容" :span="2">
          {{ currentAppeal.content }}
        </el-descriptions-item>
        <el-descriptions-item label="凭证图片" :span="2">
          <div class="evidence-images">
            <el-image
              v-for="(img, index) in currentAppeal.evidence"
              :key="index"
              :src="img"
              :preview-src-list="[img]"
              class="evidence-image"
              fit="cover"
            />
          </div>
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="warning" @click="handleArbitrate(currentAppeal)">
          仲裁处理
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 仲裁处理对话框 -->
    <el-dialog v-model="arbitrateDialogVisible" title="仲裁处理" width="600px">
      <el-form :model="arbitrateForm" label-width="100px">
        <el-form-item label="仲裁结果" required>
          <el-radio-group v-model="arbitrateForm.result">
            <el-radio label="support">支持申诉</el-radio>
            <el-radio label="reject">驳回申诉</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="仲裁说明" required>
          <el-input
            v-model="arbitrateForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请详细说明仲裁理由和处理方案"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="arbitrateDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmArbitrate">提交仲裁</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAppealList, arbitrateAppeal, getArbitrationRecords } from '@/api/appeal'

const activeTab = ref('appeal')
const loading = ref(false)
const tableData = ref([])
const recordData = ref([])
const dialogVisible = ref(false)
const arbitrateDialogVisible = ref(false)
const currentAppeal = ref(null)

const filterForm = reactive({
  appellant: '',
  type: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const arbitrateForm = reactive({
  appealId: '',
  result: 'support',
  remark: ''
})

// 模拟数据
const mockData = [
  {
    id: 1,
    appealNo: 'AP20260330001',
    appellant: '张三',
    type: '订单纠纷',
    relatedOrder: 'ORD20260328001',
    submitTime: '2026-03-30 09:00:00',
    status: 'pending',
    content: '执行者服务态度恶劣，且未完成约定服务内容，要求退款。',
    evidence: [
      'https://via.placeholder.com/300x200?text=Evidence+1',
      'https://via.placeholder.com/300x200?text=Evidence+2'
    ]
  },
  {
    id: 2,
    appealNo: 'AP20260329001',
    appellant: '李四',
    type: '费用异议',
    relatedOrder: 'ORD20260327002',
    submitTime: '2026-03-29 15:30:00',
    status: 'processing',
    content: '实际服务费用与订单金额不符，存在乱收费现象。',
    evidence: []
  }
]

const mockRecords = [
  {
    recordNo: 'AR20260328001',
    appealNo: 'AP20260328001',
    arbitrator: '管理员 A',
    result: 'support',
    arbitrateTime: '2026-03-28 16:00:00',
    remark: '经核实，执行者确实存在服务不到位情况，支持用户申诉。'
  }
]

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    processing: 'primary',
    processed: 'success'
  }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待处理',
    processing: '处理中',
    processed: '已处理'
  }
  return labels[status] || status
}

const loadData = async () => {
  loading.value = true
  try {
    tableData.value = mockData
    pagination.total = mockData.length
    recordData.value = mockRecords
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
  filterForm.appellant = ''
  filterForm.type = ''
  filterForm.status = ''
  handleSearch()
}

const handleView = (row) => {
  currentAppeal.value = row
  dialogVisible.value = true
}

const handleArbitrate = (row) => {
  currentAppeal.value = row
  arbitrateForm.appealId = row.id
  arbitrateForm.result = 'support'
  arbitrateForm.remark = ''
  arbitrateDialogVisible.value = true
}

const confirmArbitrate = async () => {
  if (!arbitrateForm.remark.trim()) {
    ElMessage.warning('请填写仲裁说明')
    return
  }
  
  try {
    await arbitrateAppeal(arbitrateForm.appealId, {
      result: arbitrateForm.result,
      remark: arbitrateForm.remark
    })
    ElMessage.success('仲裁完成')
    arbitrateDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('仲裁失败:', error)
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
.appeal-arbitration {
  padding: 0;
}

.filter-form {
  margin-bottom: 20px;
}

.evidence-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.evidence-image {
  width: 150px;
  height: 100px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
