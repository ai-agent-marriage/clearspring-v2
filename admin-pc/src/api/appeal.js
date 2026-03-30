import request from './request'

export function getAppealList(params) {
  return request({
    url: '/appeal/list',
    method: 'get',
    params
  })
}

export function getAppealDetail(id) {
  return request({
    url: `/appeal/${id}`,
    method: 'get'
  })
}

export function handleAppeal(id, data) {
  return request({
    url: `/appeal/${id}/handle`,
    method: 'post',
    data
  })
}

export function resolveAppeal(id) {
  return request({
    url: `/appeal/${id}/resolve`,
    method: 'post'
  })
}
