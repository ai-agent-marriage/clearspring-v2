<template>
  <div class="profit-sharing">
    <el-tabs v-model="activeTab">
      <!-- 平台抽成配置 -->
      <el-tab-pane label="平台抽成配置" name="platform">
        <el-card>
          <el-form :model="platformForm" label-width="150px">
            <el-form-item label="平台抽成比例">
              <el-input-number
                v-model="platformForm.platformRate"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.1"
                style="width: 200px;"
              />
              <span class="unit">%</span>
            </el-form-item>
            <el-form-item label="执行者分成比例">
              <el-input-number
                v-model="platformForm.executorRate"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.1"
                style="width: 200px;"
              />
              <span class="unit">%</span>
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                v-model="platformForm.remark"
                type="textarea"
                :rows="3"
                placeholder="备注说明"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="savePlatformConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
          
          <el-alert
            title="提示"
            type="info"
            :closable="false"
            style="margin-top: 20px;"
          >
            平台抽成比例 + 执行者分成比例 = 100%
          </el-alert>
        </el-card>
      </el-tab-pane>
      
      <!-- 服务类型配置 -->
      <el-tab-pane label="服务类型配置" name="service">
        <el-card>
          <el-table :data="serviceTypeData" border style="width: 100%">
            <el-table-column prop="name" label="服务类型" width="150" />
            <el-table-column prop="platformRate" label="平台抽成 (%)" width="150">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.platformRate"
                  :min="0"
                  :max="100"
                  :precision="1"
                  :step="0.1"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column prop="executorRate" label="执行者分成 (%)" width="150">
              <template #default="{ row }">
                {{ (100 - row.platformRate).toFixed(1) }}
              </template>
            </el-table-column>
            <el-table-column prop="minAmount" label="最低消费 (元)" width="150">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.minAmount"
                  :min="0"
                  :precision="2"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
          </el-table>
          
          <el-button type="primary" @click="saveServiceTypeConfig" style="margin-top: 20px;">
            保存配置
          </el-button>
        </el-card>
      </el-tab-pane>
      
      <!-- 阶梯奖励配置 -->
      <el-tab-pane label="阶梯奖励配置" name="reward">
        <el-card>
          <el-table :data="rewardData" border style="width: 100%">
            <el-table-column label="阶梯" width="100">
              <template #default="{ $index }">
                第{{ $index + 1 }}级
              </template>
            </el-table-column>
            <el-table-column label="最低订单数" width="150">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.minOrders"
                  :min="0"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="最高订单数" width="150">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.maxOrders"
                  :min="0"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="奖励比例 (%)" width="150">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.rewardRate"
                  :min="0"
                  :max="100"
                  :precision="1"
                  :step="0.1"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="说明" prop="description" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeRewardTier($index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-button type="success" @click="addRewardTier" style="margin-top: 10px;">
            <el-icon><Plus /></el-icon>
            添加阶梯
          </el-button>
          
          <el-button type="primary" @click="saveRewardConfig" style="margin-top: 10px; margin-left: 10px;">
            保存配置
          </el-button>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getProfitSharingConfig,
  updateProfitSharingConfig,
  getServiceTypeConfig,
  updateServiceTypeConfig,
  getRewardConfig,
  updateRewardConfig
} from '@/api/profit-sharing'

const activeTab = ref('platform')

const platformForm = reactive({
  platformRate: 20,
  executorRate: 80,
  remark: ''
})

const serviceTypeData = ref([
  {
    name: '保洁',
    platformRate: 15,
    minAmount: 50,
    description: '日常保洁、深度保洁'
  },
  {
    name: '维修',
    platformRate: 20,
    minAmount: 100,
    description: '家电维修、管道维修'
  },
  {
    name: '搬家',
    platformRate: 25,
    minAmount: 200,
    description: '居民搬家、办公室搬迁'
  },
  {
    name: '其他',
    platformRate: 20,
    minAmount: 50,
    description: '其他服务类型'
  }
])

const rewardData = ref([
  {
    minOrders: 0,
    maxOrders: 50,
    rewardRate: 0,
    description: '基础档'
  },
  {
    minOrders: 51,
    maxOrders: 100,
    rewardRate: 2,
    description: '铜牌奖励'
  },
  {
    minOrders: 101,
    maxOrders: 200,
    rewardRate: 5,
    description: '银牌奖励'
  },
  {
    minOrders: 201,
    maxOrders: null,
    rewardRate: 8,
    description: '金牌奖励'
  }
])

const savePlatformConfig = async () => {
  if (platformForm.platformRate + platformForm.executorRate !== 100) {
    ElMessage.warning('平台抽成比例 + 执行者分成比例必须等于 100%')
    return
  }
  
  try {
    await updateProfitSharingConfig({
      platformRate: platformForm.platformRate,
      executorRate: platformForm.executorRate,
      remark: platformForm.remark
    })
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const saveServiceTypeConfig = async () => {
  try {
    await updateServiceTypeConfig({
      serviceTypes: serviceTypeData.value
    })
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const addRewardTier = () => {
  const lastTier = rewardData.value[rewardData.value.length - 1]
  const newMin = lastTier ? (lastTier.maxOrders || lastTier.minOrders) + 1 : 0
  
  rewardData.value.push({
    minOrders: newMin,
    maxOrders: null,
    rewardRate: 0,
    description: ''
  })
}

const removeRewardTier = (index) => {
  rewardData.value.splice(index, 1)
}

const saveRewardConfig = async () => {
  try {
    await updateRewardConfig({
      rewardTiers: rewardData.value
    })
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const loadConfig = async () => {
  try {
    // 加载配置数据（这里使用默认值，实际应从 API 加载）
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.profit-sharing {
  padding: 0;
}

.unit {
  margin-left: 10px;
  color: #999;
}
</style>
