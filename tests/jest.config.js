/**
 * 清如 ClearSpring V2.0 - Jest 配置文件
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 超时时间（毫秒）
  testTimeout: 15000,
  
  // 详细输出
  verbose: true,
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // 忽略 node_modules
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  // 覆盖率配置
  collectCoverageFrom: [
    'api/**/*.js',
    '!api/node_modules/**',
    '!api/server.js'
  ],
  
  // 覆盖率输出目录
  coverageDirectory: 'coverage',
  
  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 测试失败时继续执行
  bail: false,
  
  // 显示每个测试的耗时
  slowTestThreshold: 5,
  
  // 测试超时强制退出
  forceExit: true,
  
  // 检测未处理的 Promise
  detectOpenHandles: true,
  
  // HTML 报告配置
  reporters: [
    'default',
    ['jest-html-reporter', {
      'pageTitle': '清如 ClearSpring V2.0 测试报告',
      'outputPath': 'test-results.html',
      'includeFailureMsg': true,
      'includeConsoleLog': true,
      'sort': 'status',
      'theme': 'default'
    }]
  ]
};
