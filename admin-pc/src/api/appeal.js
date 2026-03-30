import request from './request'

// 获取申诉列表
export function getAppealList(params) {
  return request({
    url: '/admin/appeals',
    method: 'get',
    params
  })
}

// 获取申诉详情
export function getAppealDetail(id) {
  return request({
    url: `/admin/appeals/${id}`,
    method: 'get'
  })
}

// 仲裁处理
export function arbitrateAppeal(id, data) {
  return request({
    url: `/admin/appeals/${id}/arbitrate`,
    method: 'put',
    data
  })
}

// 获取仲裁记录
export function getArbitrationRecords(params) {
  return request({
    url: '/admin/arbitration-records',
    method: 'get',
    params
  })
}
