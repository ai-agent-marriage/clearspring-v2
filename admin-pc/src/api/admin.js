import request from './request'

export function getAdminList(params) {
  return request({
    url: '/admin/list',
    method: 'get',
    params
  })
}

export function getAdminDetail(id) {
  return request({
    url: `/admin/${id}`,
    method: 'get'
  })
}

export function createAdmin(data) {
  return request({
    url: '/admin',
    method: 'post',
    data
  })
}

export function updateAdmin(id, data) {
  return request({
    url: `/admin/${id}`,
    method: 'put',
    data
  })
}

export function deleteAdmin(id) {
  return request({
    url: `/admin/${id}`,
    method: 'delete'
  })
}

export function updateAdminRole(id, data) {
  return request({
    url: `/admin/${id}/role`,
    method: 'put',
    data
  })
}

export function resetAdminPassword(id) {
  return request({
    url: `/admin/${id}/reset-password`,
    method: 'post'
  })
}
