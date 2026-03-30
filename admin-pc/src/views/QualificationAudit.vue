<template>
  <div class="qualification-audit">
    <el-card>
      <!-- 筛选栏 -->
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="申请人">
          <el-input v-model="filterForm.applicant" placeholder="请输入申请人" clearable />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="证书类型">
          <el-select v-model="filterForm.certificateType" placeholder="请选择证书类型" clearable>
            <el-option label="营业执照" value="business_license" />
            <el-option label="身份证" value="id_card" />
            <el-option label="职业资格证" value="professional_cert" />
            <el-option label="健康证" value="health_cert" />
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
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="certificateType" label="证书类型" width="120" />
        <el-table-column prop="certificateNo" label="证书编号" width="150" />
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              驳回
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
    <el-dialog v-model="dialogVisible" title="资质审核详情" width="700px">
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="申请人">{{ currentRecord.applicant }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentRecord.phone }}</el-descriptions-item>
        <el-descriptions-item label="证书类型">{{ currentRecord.certificateType }}</el-descriptions-item>
        <el-descriptions-item label="证书编号">{{ currentRecord.certificateNo }}</el-descriptions-item>
        <el-descriptions-item label="提交时间" :span="2">{{ currentRecord.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="getStatusType(currentRecord.status)">
            {{ getStatusLabel(currentRecord.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <el-divider>证书图片</el-divider>
      <div class="certificate-images">
        <el-image
          v-for="(img, index) in currentRecord?.images"
          :key="index"
          :src="img"
          :preview-src-list="[img]"
          class="certificate-image"
          fit="cover"
        />
      </div>
      
      <el-divider>审核意见</el-divider>
      <el-input
        v-model="auditOpinion"
        type="textarea"
        :rows="3"
        placeholder="请输入审核意见"
      />
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmApprove">审核通过</el-button>
        <el-button type="danger" @click="confirmReject">驳回</el-button>
      </template>
    </el-dialog>
    
    <!-- 驳回原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="填写驳回原因" width="500px">
      <el-form :model="rejectForm">
        <el-form-item label="驳回原因" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明驳回原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmRejectSubmit">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getQualificationList, approveQualification, rejectQualification } from '@/api/qualification'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentRecord = ref(null)
const auditOpinion = ref('')

const filterForm = reactive({
  applicant: '',
  status: '',
  certificateType: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const rejectForm = reactive({
  recordId: '',
  reason: ''
})

// 模拟数据
const mockData = [
  {
    id: 1,
    applicant: '张三',
    phone: '138****1234',
    certificateType: '营业执照',
    certificateNo: '91110000XXXXXXXXXX',
    submitTime: '2026-03-29 14:30:00',
    status: 'pending',
    images: [
      'https://via.placeholder.com/300x200?text=Certificate+1',
      'https://via.placeholder.com/300x200?text=Certificate+2'
    ]
  },
  {
    id: 2,
    applicant: '李四',
    phone: '139****5678',
    certificateType: '身份证',
    certificateNo: '11010119900101XXXX',
    submitTime: '2026-03-28 10:15:00',
    status: 'approved',
    images: [
      'https://via.placeholder.com/300x200?text=ID+Card'
    ]
  }
]

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回'
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
  filterForm.applicant = ''
  filterForm.status = ''
  filterForm.certificateType = ''
  handleSearch()
}

const handleView = (row) => {
  currentRecord.value = row
  auditOpinion.value = ''
  dialogVisible.value = true
}

const handleApprove = (row) => {
  currentRecord.value = row
  auditOpinion.value = ''
  dialogVisible.value = true
}

const confirmApprove = async () => {
  try {
    await approveQualification(currentRecord.value.id, {
      opinion: auditOpinion.value
    })
    ElMessage.success('审核通过')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('审核通过失败:', error)
  }
}

const handleReject = (row) => {
  currentRecord.value = row
  rejectForm.recordId = row.id
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const confirmRejectSubmit = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  
  try {
    await rejectQualification(rejectForm.recordId, {
      reason: rejectForm.reason
    })
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('驳回失败:', error)
  }
}

const confirmReject = () => {
  handleReject(currentRecord.value)
  dialogVisible.value = false
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
.qualification-audit {
  padding: 0;
}

.filter-form {
  margin-bottom: 20px;
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
