import request from './request'

// 获取执行者列表
export function getExecutorList(params) {
  return request({
    url: '/admin/executors',
    method: 'get',
    params
  })
}

// 获取执行者详情
export function getExecutorDetail(id) {
  return request({
    url: `/admin/executors/${id}`,
    method: 'get'
  })
}

// 更新执行者状态
export function updateExecutorStatus(id, data) {
  return request({
    url: `/admin/executors/${id}/status`,
    method: 'put',
    data
  })
}

// 封禁执行者
export function banExecutor(id, data) {
  return request({
    url: `/admin/executors/${id}/ban`,
    method: 'put',
    data
  })
}
