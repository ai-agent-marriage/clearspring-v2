# 表单验证组件 (form-validator)

清如 ClearSpring V2.0 通用表单验证组件，支持多种验证类型和美观的错误提示。

## 📁 文件结构

```
form-validator/
├── form-validator.js      # 验证逻辑
├── form-validator.json    # 组件配置
├── form-validator.wxml    # 组件模板
├── form-validator.wxss    # 组件样式
└── README.md              # 使用文档
```

## ✨ 支持的验证类型

| 验证类型 | 参数 | 说明 | 示例 |
|---------|------|------|------|
| required | - | 必填验证 | `{ required: true }` |
| mobile | - | 手机号验证（11 位） | `{ mobile: true }` |
| email | - | 邮箱验证 | `{ email: true }` |
| minLength | number | 最小长度 | `{ minLength: 6 }` |
| maxLength | number | 最大长度 | `{ maxLength: 20 }` |
| pattern | RegExp/string | 正则表达式 | `{ pattern: /^\d+$/ }` |
| validator | function | 自定义验证函数 | `{ validator: (v) => v === 'admin' }` |

## 🚀 快速开始

### 1. 在页面中引入组件

在页面的 `.json` 配置文件中添加：

```json
{
  "usingComponents": {
    "form-validator": "/components/form-validator/form-validator"
  }
}
```

### 2. 在 WXML 中使用

```xml
<!-- 基础用法：手机号验证 -->
<form-validator 
  rules="{{mobileRules}}" 
  field-name="手机号"
  bind:error="onError"
  bind:success="onSuccess"
>
  <input 
    class="form-input {{phoneError ? 'input-error' : ''}}"
    type="number" 
    placeholder="请输入手机号码"
    value="{{contactPhone}}"
    bindinput="onPhoneInput"
    maxlength="11"
  />
</form-validator>

<!-- 多规则验证：邮箱（必填 + 邮箱格式） -->
<form-validator 
  rules="{{emailRules}}" 
  field-name="邮箱"
  auto-hide-delay="3000"
>
  <input 
    class="form-input"
    type="text" 
    placeholder="请输入邮箱地址"
    value="{{email}}"
    bindinput="onEmailInput"
  />
</form-validator>

<!-- 自定义验证函数 -->
<form-validator 
  rules="{{customRules}}" 
  field-name="验证码"
>
  <input 
    class="form-input"
    type="number" 
    placeholder="请输入验证码"
    value="{{code}}"
    bindinput="onCodeInput"
  />
</form-validator>
```

### 3. 在 JS 中定义验证规则

```javascript
Page({
  data: {
    contactPhone: '',
    phoneError: false,
    
    // 手机号验证规则
    mobileRules: [
      { 
        required: true, 
        message: '请输入手机号码' 
      },
      { 
        mobile: true, 
        message: '手机号码格式不正确' 
      }
    ],
    
    // 邮箱验证规则
    emailRules: [
      { required: true, message: '请输入邮箱地址' },
      { email: true, message: '邮箱格式不正确' }
    ],
    
    // 自定义验证规则
    customRules: [
      { 
        required: true, 
        message: '请输入验证码' 
      },
      { 
        minLength: 4, 
        message: '验证码至少 4 位' 
      },
      { 
        validator: (value) => value === '1234',
        message: '验证码错误' 
      }
    ]
  },

  // 监听验证错误
  onError(e) {
    console.log('验证错误:', e.detail.message);
    this.setData({ phoneError: true });
  },

  // 监听验证成功
  onSuccess(e) {
    console.log('验证通过');
    this.setData({ phoneError: false });
  },

  // 输入时验证
  onPhoneInput(e) {
    const value = e.detail.value;
    this.setData({ contactPhone: value });
    
    // 获取组件实例并验证
    const validator = this.selectComponent('.phone-validator');
    if (validator) {
      const isValid = validator.validate(value);
      this.setData({ phoneError: !isValid });
    }
  },

  // 提交表单时验证
  submitForm() {
    const phoneValidator = this.selectComponent('.phone-validator');
    const emailValidator = this.selectComponent('.email-validator');
    
    // 验证所有字段
    const isPhoneValid = phoneValidator.validate(this.data.contactPhone);
    const isEmailValid = emailValidator.validate(this.data.email);
    
    if (!isPhoneValid || !isEmailValid) {
      wx.showToast({
        title: '请完善表单信息',
        icon: 'none'
      });
      return;
    }
    
    // 所有验证通过，提交表单
    this.submitOrder();
  }
});
```

## 📋 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| rules | Array | [] | 验证规则数组 |
| field-name | String | '此字段' | 字段名称（用于错误提示） |
| immediate | Boolean | false | 是否立即验证 |
| auto-hide-delay | Number | 3000 | 错误消息自动消失时间（毫秒），0 为不消失 |

## 📡 组件事件

| 事件 | 参数 | 说明 |
|-----|------|------|
| bind:error | `{message: string, valid: false}` | 验证失败时触发 |
| bind:success | `{valid: true}` | 验证通过时触发 |

## 🎨 样式定制

组件提供了以下 CSS 类供定制：

```css
/* 错误提示消息 */
.error-message {
  /* 自定义样式 */
}

/* 错误提示文字 */
.error-text {
  /* 自定义样式 */
}

/* 输入框错误状态（需手动添加） */
.input-error {
  border-color: #ff4d4f !important;
  background-color: #fff5f5 !important;
}
```

## 🔧 组件方法

通过 `this.selectComponent()` 获取组件实例后调用：

```javascript
const validator = this.selectComponent('.validator');

// 验证
validator.validate(value);

// 手动清除错误
validator.clearError();

// 手动显示错误
validator.showError('错误消息');

// 获取验证状态
const isValid = validator.isValid();
```

## 📝 完整示例：订单创建表单

```xml
<!-- pages/order/order.wxml -->
<form-validator 
  class="phone-validator"
  rules="{{phoneRules}}" 
  field-name="联系电话"
  bind:error="onPhoneError"
  bind:success="onPhoneSuccess"
>
  <input 
    class="form-input {{phoneInvalid ? 'input-error' : ''}}"
    type="number" 
    placeholder="请输入手机号码"
    value="{{contactPhone}}"
    bindinput="onPhoneInput"
    maxlength="11"
  />
</form-validator>

<form-validator 
  class="blessing-validator"
  rules="{{blessingRules}}" 
  field-name="祈福对象"
  auto-hide-delay="2000"
>
  <textarea 
    class="blessing-input {{blessingInvalid ? 'input-error' : ''}}"
    placeholder="请输入祈福对象姓名"
    value="{{blessingTarget}}"
    bindinput="onBlessingInput"
    maxlength="100"
  />
</form-validator>

<button bindtap="submitOrder">提交订单</button>
```

```javascript
// pages/order/order.js
Page({
  data: {
    contactPhone: '',
    blessingTarget: '',
    phoneInvalid: false,
    blessingInvalid: false,
    
    phoneRules: [
      { required: true, message: '请输入联系电话' },
      { mobile: true, message: '手机号码格式不正确' }
    ],
    
    blessingRules: [
      { maxLength: 100, message: '祈福对象不能超过 100 字' }
    ]
  },

  onPhoneInput(e) {
    const value = e.detail.value;
    this.setData({ contactPhone: value });
    
    const validator = this.selectComponent('.phone-validator');
    if (validator) {
      const isValid = validator.validate(value);
      this.setData({ phoneInvalid: !isValid });
    }
  },

  onBlessingInput(e) {
    const value = e.detail.value;
    this.setData({ blessingTarget: value });
    
    const validator = this.selectComponent('.blessing-validator');
    if (validator) {
      const isValid = validator.validate(value);
      this.setData({ blessingInvalid: !isValid });
    }
  },

  submitOrder() {
    const phoneValidator = this.selectComponent('.phone-validator');
    const blessingValidator = this.selectComponent('.blessing-validator');
    
    const isPhoneValid = phoneValidator.validate(this.data.contactPhone);
    const isBlessingValid = blessingValidator.validate(this.data.blessingTarget);
    
    if (!isPhoneValid) {
      wx.showToast({ title: '请填写正确的手机号', icon: 'none' });
      return;
    }
    
    if (!isBlessingValid) {
      wx.showToast({ title: '祈福对象格式不正确', icon: 'none' });
      return;
    }
    
    // 提交订单逻辑
    console.log('提交订单:', this.data);
  }
});
```

## ⚠️ 注意事项

1. **规则顺序**：验证规则按数组顺序依次执行，遇到第一个失败的规则即停止
2. **空值处理**：非必填字段在值为空时会跳过格式验证（mobile、email 等）
3. **自定义函数**：`validator` 函数应返回布尔值，抛出异常会被捕获并显示错误
4. **性能优化**：建议在 `blur` 或 `submit` 时验证，避免在 `input` 时频繁验证
5. **样式兼容**：输入框的错误样式需要手动添加 `input-error` 类

## 🎯 最佳实践

1. **必填 + 格式组合**：对于手机号、邮箱等字段，建议同时使用 `required` 和格式验证
2. **友好的错误消息**：为每条规则自定义 `message`，提升用户体验
3. **实时反馈**：在输入时验证，让用户即时了解输入是否正确
4. **提交前全量验证**：在提交表单前验证所有字段，确保数据完整性
5. **错误自动消失**：设置合理的 `auto-hide-delay`，避免错误消息长时间遮挡

## 📦 更新日志

- **v1.0.0** (2026-03-31)
  - ✅ 支持 6 种验证类型
  - ✅ 美观的错误提示样式
  - ✅ 自动消失功能
  - ✅ 自定义验证函数
  - ✅ 完整的使用文档

---

**组件作者**: 清如 ClearSpring V2.0 开发团队  
**最后更新**: 2026-03-31
