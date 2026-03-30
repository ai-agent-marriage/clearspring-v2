import request from './request'

export function getQualificationList(params) {
  return request({
    url: '/qualification/list',
    method: 'get',
    params
  })
}

export function getQualificationDetail(id) {
  return request({
    url: `/qualification/${id}`,
    method: 'get'
  })
}

export function reviewQualification(id, data) {
  return request({
    url: `/qualification/${id}/review`,
    method: 'post',
    data
  })
}

export function approveQualification(id) {
  return request({
    url: `/qualification/${id}/approve`,
    method: 'post'
  })
}

export function rejectQualification(id, data) {
  return request({
    url: `/qualification/${id}/reject`,
    method: 'post',
    data
  })
}
