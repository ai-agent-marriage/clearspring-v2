import request from './request'

/**
 * 获取申诉列表
 */
export function getAppealList(params) {
  return request({
    url: '/admin/appeals',
    method: 'get',
    params
  })
}

/**
 * 获取申诉详情
 */
export function getAppealDetail(id) {
  return request({
    url: `/admin/appeals/${id}`,
    method: 'get'
  })
}

/**
 * 仲裁申诉
 */
export function arbitrateAppeal(id, result, reason = '') {
  return request({
    url: `/admin/appeals/${id}/arbitrate`,
    method: 'put',
    data: {
      result,
      reason
    }
  })
}
