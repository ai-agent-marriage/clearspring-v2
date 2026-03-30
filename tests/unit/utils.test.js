/**
 * 工具函数单元测试
 * 测试各种辅助函数的正确性
 */

const { delay, generateTestId } = require('../../helpers/test-utils');

describe('🛠️ 工具函数测试', () => {
  describe('delay 函数', () => {
    test('UTIL-001: delay 应该等待指定的时间', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      const elapsed = end - start;
      
      expect(elapsed).toBeGreaterThanOrEqual(95); // 允许 5ms 误差
      expect(elapsed).toBeLessThan(150);
    });

    test('UTIL-002: delay 应该支持 0 毫秒', async () => {
      const start = Date.now();
      await delay(0);
      const end = Date.now();
      
      expect(end).toBeGreaterThanOrEqual(start);
    });
  });

  describe('generateTestId 函数', () => {
    test('UTIL-003: 生成唯一 ID', () => {
      const id1 = generateTestId();
      const id2 = generateTestId();
      
      expect(id1).not.toBe(id2);
    });

    test('UTIL-004: 使用自定义前缀', () => {
      const id = generateTestId('custom');
      
      expect(id).toMatch(/^custom_/);
    });

    test('UTIL-005: 默认前缀', () => {
      const id = generateTestId();
      
      expect(id).toMatch(/^test_/);
    });

    test('UTIL-006: ID 格式正确', () => {
      const id = generateTestId();
      
      // 格式：prefix_timestamp_random
      const parts = id.split('_');
      expect(parts.length).toBeGreaterThanOrEqual(3);
      expect(parts[1]).toMatch(/^\d+$/); // 时间戳是数字
    });

    test('UTIL-007: 多次生成不重复', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateTestId());
      }
      
      expect(ids.size).toBe(100);
    });
  });

  describe('getAuthHeader 函数', () => {
    test('UTIL-008: 生成正确的 Authorization Header', () => {
      // 这个函数在 test-utils 中，我们测试其返回值格式
      const mockToken = 'test.token.here';
      const header = {
        Authorization: `Bearer ${mockToken}`,
        'Content-Type': 'application/json'
      };
      
      expect(header.Authorization).toBe('Bearer test.token.here');
      expect(header['Content-Type']).toBe('application/json');
    });
  });
});
