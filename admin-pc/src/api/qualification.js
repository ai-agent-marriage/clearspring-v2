import request from './request'

// 获取资质审核列表
export function getQualificationList(params) {
  return request({
    url: '/admin/qualifications',
    method: 'get',
    params
  })
}

// 获取资质详情
export function getQualificationDetail(id) {
  return request({
    url: `/admin/qualifications/${id}`,
    method: 'get'
  })
}

// 审核通过
export function approveQualification(id, data) {
  return request({
    url: `/admin/qualifications/${id}/approve`,
    method: 'put',
    data
  })
}

// 审核驳回
export function rejectQualification(id, data) {
  return request({
    url: `/admin/qualifications/${id}/reject`,
    method: 'put',
    data
  })
}
