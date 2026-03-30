<template>
  <div class="data-export">
    <el-row :gutter="20">
      <!-- 数据导出 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>数据导出</span>
          </template>
          
          <el-form :model="exportForm" label-width="120px">
            <el-form-item label="导出类型" required>
              <el-radio-group v-model="exportForm.type">
                <el-radio label="orders">订单数据</el-radio>
                <el-radio label="executors">执行者数据</el-radio>
                <el-radio label="revenue">收入数据</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="时间范围" required>
              <el-date-picker
                v-model="exportForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%;"
              />
            </el-form-item>
            
            <el-form-item label="导出格式" required>
              <el-radio-group v-model="exportForm.format">
                <el-radio label="xlsx">Excel (.xlsx)</el-radio>
                <el-radio label="csv">CSV (.csv)</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="筛选条件">
              <el-select
                v-if="exportForm.type === 'orders'"
                v-model="exportForm.status"
                placeholder="订单状态"
                multiple
                style="width: 100%;"
              >
                <el-option label="待接单" value="pending" />
                <el-option label="进行中" value="in_progress" />
                <el-option label="已完成" value="completed" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
              
              <el-select
                v-if="exportForm.type === 'executors'"
                v-model="exportForm.executorStatus"
                placeholder="执行者状态"
                multiple
                style="width: 100%;"
              >
                <el-option label="激活" value="active" />
                <el-option label="禁用" value="disabled" />
                <el-option label="封禁" value="banned" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                :loading="exporting"
                @click="handleExport"
              >
                <el-icon><Download /></el-icon>
                开始导出
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <!-- 导出历史 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>导出历史</span>
          </template>
          
          <el-timeline>
            <el-timeline-item
              v-for="record in exportHistory"
              :key="record.id"
              :timestamp="record.exportTime"
              placement="top"
            >
              <el-card shadow="hover">
                <div class="export-record">
                  <div class="record-header">
                    <el-tag :type="getFileTypeType(record.format)">
                      {{ record.format.toUpperCase() }}
                    </el-tag>
                    <span class="record-type">{{ getExportTypeName(record.type) }}</span>
                  </div>
                  <div class="record-info">
                    <span>文件大小：{{ record.fileSize }}</span>
                    <span>记录数：{{ record.recordCount }}</span>
                  </div>
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleDownload(record)"
                  >
                    下载
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { exportOrderList, exportExecutorList, exportProfitRecords, exportQualificationList } from '@/api/export'

const exporting = ref(false)
const exportHistory = ref([])

const exportForm = reactive({
  type: 'orders',
  dateRange: [],
  format: 'xlsx',
  status: [],
  executorStatus: []
})

// 模拟导出历史
const mockHistory = [
  {
    id: 1,
    type: 'orders',
    format: 'xlsx',
    fileSize: '2.5 MB',
    recordCount: 1250,
    exportTime: '2026-03-30 10:30:00',
    downloadUrl: '/exports/orders_20260330.xlsx'
  },
  {
    id: 2,
    type: 'executors',
    format: 'csv',
    fileSize: '156 KB',
    recordCount: 342,
    exportTime: '2026-03-29 15:20:00',
    downloadUrl: '/exports/executors_20260329.csv'
  },
  {
    id: 3,
    type: 'revenue',
    format: 'xlsx',
    fileSize: '1.8 MB',
    recordCount: 890,
    exportTime: '2026-03-28 09:00:00',
    downloadUrl: '/exports/revenue_20260328.xlsx'
  }
]

const getExportTypeName = (type) => {
  const names = {
    orders: '订单数据',
    executors: '执行者数据',
    revenue: '收入数据'
  }
  return names[type] || type
}

const getFileTypeType = (format) => {
  const types = {
    xlsx: 'success',
    csv: 'primary'
  }
  return types[format] || ''
}

const handleExport = async () => {
  if (!exportForm.dateRange || exportForm.dateRange.length !== 2) {
    ElMessage.warning('请选择时间范围')
    return
  }
  
  exporting.value = true
  
  try {
    let exportFunc
    switch (exportForm.type) {
      case 'orders':
        exportFunc = exportOrders
        break
      case 'executors':
        exportFunc = exportExecutors
        break
      case 'revenue':
        exportFunc = exportRevenue
        break
      default:
        throw new Error('未知的导出类型')
    }
    
    const params = {
      startDate: exportForm.dateRange[0],
      endDate: exportForm.dateRange[1],
      format: exportForm.format
    }
    
    if (exportForm.type === 'orders' && exportForm.status.length) {
      params.status = exportForm.status.join(',')
    }
    
    if (exportForm.type === 'executors' && exportForm.executorStatus.length) {
      params.status = exportForm.executorStatus.join(',')
    }
    
    const response = await exportFunc(params)
    
    // 创建下载链接
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${exportForm.type}_${new Date().toISOString().split('T')[0]}.${exportForm.format}`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
    loadExportHistory()
  } catch (error) {
    console.error('导出失败:', error)
  } finally {
    exporting.value = false
  }
}

const handleDownload = (record) => {
  // 模拟下载
  ElMessage.success(`开始下载：${record.downloadUrl}`)
}

const loadExportHistory = async () => {
  try {
    exportHistory.value = mockHistory
  } catch (error) {
    console.error('加载导出历史失败:', error)
  }
}

onMounted(() => {
  loadExportHistory()
})
</script>

<style scoped>
.data-export {
  padding: 0;
}

.export-record {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-type {
  font-weight: 500;
  color: #333;
}

.record-info {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #666;
}
</style>
