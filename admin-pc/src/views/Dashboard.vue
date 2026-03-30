<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409EFF;">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayOrders }}</div>
              <div class="stat-label">今日订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #E6A23C;">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingAudit }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67C23A;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.executors }}</div>
              <div class="stat-label">执行者</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #F56C6C;">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ stats.revenue }}</div>
              <div class="stat-label">收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <!-- 订单趋势图 -->
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>订单趋势</span>
              <el-radio-group v-model="chartPeriod" size="small">
                <el-radio-button label="week">近 7 天</el-radio-button>
                <el-radio-button label="month">近 30 天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="chartRef" class="chart"></div>
        </el-card>
      </el-col>
      
      <!-- 快捷操作 -->
      <el-col :span="8">
        <el-card class="quick-actions">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="action-list">
            <el-button type="primary" @click="$router.push('/order-list')">
              <el-icon><List /></el-icon>
              订单管理
            </el-button>
            <el-button type="warning" @click="$router.push('/qualification-audit')">
              <el-icon><DocumentChecked /></el-icon>
              资质审核
            </el-button>
            <el-button type="success" @click="$router.push('/executor-manage')">
              <el-icon><User /></el-icon>
              执行者管理
            </el-button>
            <el-button type="info" @click="$router.push('/data-export')">
              <el-icon><Download /></el-icon>
              数据导出
            </el-button>
          </div>
        </el-card>
        
        <!-- 系统公告 -->
        <el-card class="notice-card">
          <template #header>
            <span>系统公告</span>
          </template>
          <el-timeline>
            <el-timeline-item timestamp="2026-03-30" placement="top">
              <el-card>
                <h4>系统升级通知</h4>
                <p>系统将于今晚 23:00 进行例行维护，预计耗时 1 小时。</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2026-03-28" placement="top">
              <el-card>
                <h4>新功能上线</h4>
                <p>分账配置功能已上线，支持差异化配置。</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const stats = reactive({
  todayOrders: 126,
  pendingAudit: 23,
  executors: 342,
  revenue: 15680
})

const chartPeriod = ref('week')
const chartRef = ref(null)
let chart = null

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['订单量', '完成量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['03-24', '03-25', '03-26', '03-27', '03-28', '03-29', '03-30']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '订单量',
        type: 'line',
        data: [82, 93, 105, 126, 118, 134, 126],
        smooth: true,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '完成量',
        type: 'line',
        data: [75, 88, 98, 115, 110, 125, 118],
        smooth: true,
        itemStyle: { color: '#67C23A' }
      }
    ]
  }
  
  chart.setOption(option)
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
  
  window.addEventListener('resize', () => {
    chart?.resize()
  })
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon .el-icon {
  font-size: 30px;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card,
.quick-actions,
.notice-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 300px;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-list .el-button {
  width: 100%;
  justify-content: flex-start;
}

.action-list .el-icon {
  margin-right: 8px;
}

.notice-card :deep(.el-timeline) {
  padding: 10px 0;
}
</style>
