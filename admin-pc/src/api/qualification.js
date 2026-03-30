import request from './request'

/**
 * 获取资质审核列表
 */
export function getQualificationList(params) {
  return request({
    url: '/admin/qualifications',
    method: 'get',
    params
  })
}

/**
 * 获取资质详情
 */
export function getQualificationDetail(id) {
  return request({
    url: `/admin/qualifications/${id}`,
    method: 'get'
  })
}

/**
 * 审核资质（通过/驳回）
 */
export function auditQualification(id, status, reason = '') {
  return request({
    url: `/admin/qualifications/${id}`,
    method: 'put',
    data: {
      status,
      reason
    }
  })
}

/**
 * 导出资质数据
 */
export function exportQualifications(params) {
  return request({
    url: '/admin/qualifications/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
