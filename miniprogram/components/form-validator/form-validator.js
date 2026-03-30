/**
 * 表单验证组件
 * 支持的验证类型：
 * - required: 必填验证
 * - mobile: 手机号验证
 * - email: 邮箱验证
 * - minLength: 最小长度验证
 * - maxLength: 最大长度验证
 * - pattern: 正则表达式验证
 * - validator: 自定义验证函数
 */

Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },

  /**
   * 组件属性
   */
  properties: {
    // 验证规则数组
    rules: {
      type: Array,
      value: []
    },
    // 字段名称（用于错误提示）
    fieldName: {
      type: String,
      value: '此字段'
    },
    // 是否立即验证
    immediate: {
      type: Boolean,
      value: false
    },
    // 错误消息自动消失时间（毫秒），0 为不消失
    autoHideDelay: {
      type: Number,
      value: 3000
    }
  },

  /**
   * 组件数据
   */
  data: {
    showError: false,
    errorMessage: '',
    isValid: true
  },

  /**
   * 生命周期
   */
  lifetimes: {
    attached() {
      if (this.data.immediate && this.data.rules.length > 0) {
        // 如果设置了立即验证，在组件附加时验证
        this.validate('');
      }
    },

    detached() {
      // 清除定时器
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
    }
  },

  /**
   * 监听器
   */
  observers: {
    // 监听规则变化
    rules: function(newRules) {
      if (newRules && newRules.length > 0) {
        this._initRules();
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 初始化验证规则
     */
    _initRules() {
      // 可以在这里对规则进行预处理
    },

    /**
     * 验证方法
     * @param {any} value - 要验证的值
     * @returns {boolean} - 验证结果
     */
    validate(value) {
      const rules = this.data.rules;
      
      // 没有规则时默认通过
      if (!rules || rules.length === 0) {
        this._clearError();
        return true;
      }

      // 转换为字符串进行处理（空值特殊处理）
      const strValue = value === null || value === undefined ? '' : String(value);

      // 遍历所有验证规则
      for (let rule of rules) {
        const result = this._validateRule(strValue, rule);
        
        if (!result.valid) {
          this._showError(result.message);
          return false;
        }
      }

      // 所有验证通过
      this._clearError();
      return true;
    },

    /**
     * 验证单条规则
     * @param {string} value - 验证值
     * @param {object} rule - 验证规则
     * @returns {object} - {valid: boolean, message: string}
     */
    _validateRule(value, rule) {
      // 必填验证
      if (rule.required) {
        if (!value || value.trim() === '') {
          return {
            valid: false,
            message: rule.message || `${this.data.fieldName}不能为空`
          };
        }
      }

      // 如果值为空且不是必填，跳过其他验证
      if (!value && !rule.required) {
        return { valid: true, message: '' };
      }

      // 手机号验证
      if (rule.mobile) {
        const mobileReg = /^1[3-9]\d{9}$/;
        if (!mobileReg.test(value)) {
          return {
            valid: false,
            message: rule.message || '请输入正确的手机号码'
          };
        }
      }

      // 邮箱验证
      if (rule.email) {
        const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailReg.test(value)) {
          return {
            valid: false,
            message: rule.message || '请输入正确的邮箱地址'
          };
        }
      }

      // 最小长度验证
      if (rule.minLength !== undefined) {
        if (value.length < rule.minLength) {
          return {
            valid: false,
            message: rule.message || `${this.data.fieldName}长度不能少于${rule.minLength}个字符`
          };
        }
      }

      // 最大长度验证
      if (rule.maxLength !== undefined) {
        if (value.length > rule.maxLength) {
          return {
            valid: false,
            message: rule.message || `${this.data.fieldName}长度不能超过${rule.maxLength}个字符`
          };
        }
      }

      // 正则表达式验证
      if (rule.pattern) {
        const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
        if (!regex.test(value)) {
          return {
            valid: false,
            message: rule.message || `${this.data.fieldName}格式不正确`
          };
        }
      }

      // 自定义验证函数
      if (rule.validator && typeof rule.validator === 'function') {
        try {
          const isValid = rule.validator(value);
          if (!isValid) {
            return {
              valid: false,
              message: rule.message || `${this.data.fieldName}验证失败`
            };
          }
        } catch (e) {
          console.error('自定义验证函数执行失败:', e);
          return {
            valid: false,
            message: rule.message || `${this.data.fieldName}验证出错`
          };
        }
      }

      return { valid: true, message: '' };
    },

    /**
     * 显示错误消息
     * @param {string} message - 错误消息
     */
    _showError(message) {
      this.setData({
        showError: true,
        errorMessage: message,
        isValid: false
      });

      // 触发错误事件
      this.triggerEvent('error', {
        message: message,
        valid: false
      });

      // 自动隐藏
      if (this.data.autoHideDelay > 0) {
        if (this.hideTimer) {
          clearTimeout(this.hideTimer);
        }
        this.hideTimer = setTimeout(() => {
          this._clearError();
        }, this.data.autoHideDelay);
      }
    },

    /**
     * 清除错误消息
     */
    _clearError() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }

      this.setData({
        showError: false,
        errorMessage: '',
        isValid: true
      });

      // 触发成功事件
      this.triggerEvent('success', {
        valid: true
      });
    },

    /**
     * 手动清除错误
     */
    clearError() {
      this._clearError();
    },

    /**
     * 手动显示错误
     * @param {string} message - 错误消息
     */
    showError(message) {
      this._showError(message);
    },

    /**
     * 获取验证状态
     * @returns {boolean} - 是否有效
     */
    isValid() {
      return this.data.isValid;
    }
  }
});
