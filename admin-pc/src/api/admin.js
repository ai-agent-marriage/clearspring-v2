import request from './request'

/**
 * 管理员登录
 */
export function adminLogin(username, password) {
  return request({
    url: '/admin/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

/**
 * 获取管理员信息
 */
export function getAdminInfo() {
  return request({
    url: '/admin/info',
    method: 'get'
  })
}

/**
 * 退出登录
 */
export function adminLogout() {
  return request({
    url: '/admin/logout',
    method: 'post'
  })
}

/**
 * 修改密码
 */
export function changePassword(oldPassword, newPassword) {
  return request({
    url: '/admin/change-password',
    method: 'post',
    data: {
      oldPassword,
      newPassword
    }
  })
}
