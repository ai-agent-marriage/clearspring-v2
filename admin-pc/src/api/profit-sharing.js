import request from './request'

// 获取分账配置
export function getProfitSharingConfig() {
  return request({
    url: '/admin/profit-sharing/config',
    method: 'get'
  })
}

// 更新分账配置
export function updateProfitSharingConfig(data) {
  return request({
    url: '/admin/profit-sharing/config',
    method: 'put',
    data
  })
}

// 获取服务类型配置
export function getServiceTypeConfig() {
  return request({
    url: '/admin/profit-sharing/service-types',
    method: 'get'
  })
}

// 更新服务类型配置
export function updateServiceTypeConfig(data) {
  return request({
    url: '/admin/profit-sharing/service-types',
    method: 'put',
    data
  })
}

// 获取阶梯奖励配置
export function getRewardConfig() {
  return request({
    url: '/admin/profit-sharing/rewards',
    method: 'get'
  })
}

// 更新阶梯奖励配置
export function updateRewardConfig(data) {
  return request({
    url: '/admin/profit-sharing/rewards',
    method: 'put',
    data
  })
}
