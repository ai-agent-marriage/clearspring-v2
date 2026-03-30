import request from './request'

/**
 * 获取执行者列表
 */
export function getExecutorList(params) {
  return request({
    url: '/admin/executors',
    method: 'get',
    params
  })
}

/**
 * 获取执行者详情
 */
export function getExecutorDetail(id) {
  return request({
    url: `/admin/executors/${id}`,
    method: 'get'
  })
}

/**
 * 更新执行者状态
 */
export function updateExecutorStatus(id, status, reason = '') {
  return request({
    url: `/admin/executors/${id}/status`,
    method: 'put',
    data: {
      status,
      reason
    }
  })
}

/**
 * 导出执行者数据
 */
export function exportExecutors(params) {
  return request({
    url: '/admin/executors/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
