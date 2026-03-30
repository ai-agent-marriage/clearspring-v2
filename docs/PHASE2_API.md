# 清如 ClearSpring V2.0 - Phase 2 内容生态 API 文档

## 概述

Phase 2 为内容生态提供完整的后端 API 支持，包含内容管理、冥想模块和仪轨学习三大模块。

---

## 1. 内容管理 API（admin-pc 使用）

### 1.1 创建内容
```
POST /api/content/admin/wiki/create
```

**请求体:**
```json
{
  "title": "冥想入门指南",
  "category": "meditation",
  "content": "正文内容...",
  "tags": ["冥想", "入门"],
  "coverImage": "图片 URL",
  "status": "draft" // draft | published | archived
}
```

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "创建成功",
  "data": {
    "wikiId": "...",
    "title": "冥想入门指南",
    "status": "draft",
    "createdAt": "2026-03-30T13:00:00.000Z"
  }
}
```

---

### 1.2 更新内容
```
PUT /api/content/admin/wiki/:id
```

**请求体:**
```json
{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "status": "published"
}
```

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "更新成功",
  "data": {
    "wikiId": "...",
    "updatedAt": "2026-03-30T13:00:00.000Z"
  }
}
```

---

### 1.3 删除内容
```
DELETE /api/content/admin/wiki/:id
```

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "删除成功",
  "data": {
    "wikiId": "...",
    "title": "冥想入门指南",
    "deletedAt": "2026-03-30T13:00:00.000Z"
  }
}
```

---

### 1.4 内容列表（分页/筛选）
```
GET /api/content/admin/wiki/list?page=1&pageSize=20&category=meditation&status=published&keyword=关键词
```

**查询参数:**
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 20）
- `category`: 分类筛选
- `status`: 状态筛选
- `keyword`: 关键词搜索

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## 2. 冥想模块 API

### 2.1 冥想课程列表
```
GET /api/content/meditation/courses?category=morning&level=beginner&duration=5
```

**查询参数:**
- `category`: 分类（morning | relaxation | sleep）
- `level`: 难度（beginner | intermediate | advanced）
- `duration`: 时长（分钟）

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "courses": [
      {
        "courseId": "...",
        "title": "清晨唤醒冥想",
        "description": "5 分钟清晨冥想...",
        "category": "morning",
        "level": "beginner",
        "duration": 5,
        "audioUrl": "...",
        "coverImage": "...",
        "instructor": "清如导师",
        "playCount": 0,
        "likeCount": 0,
        "order": 1,
        "status": "published"
      }
    ]
  }
}
```

---

### 2.2 课程详情
```
GET /api/content/meditation/course/:id
```

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "courseId": "...",
    "title": "清晨唤醒冥想",
    "description": "...",
    "category": "morning",
    "level": "beginner",
    "duration": 5,
    "audioUrl": "...",
    "coverImage": "...",
    "instructor": "清如导师",
    "playCount": 1,
    "likeCount": 0,
    "status": "published",
    "createdAt": "..."
  }
}
```

---

### 2.3 记录冥想完成
```
POST /api/content/meditation/record
Authorization: Bearer <token>
```

**请求体:**
```json
{
  "courseId": "...",
  "duration": 5
}
```

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "记录成功",
  "data": {
    "recordId": "...",
    "courseId": "...",
    "duration": 5,
    "completedAt": "2026-03-30T13:00:00.000Z"
  }
}
```

---

### 2.4 用户冥想统计
```
GET /api/content/meditation/stats
Authorization: Bearer <token>
```

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "totalCount": 10,
    "totalDuration": 120,
    "streakDays": 5,
    "recentWeekCount": 7,
    "lastCompletedAt": "2026-03-30T08:00:00.000Z"
  }
}
```

---

## 3. 仪轨学习 API

### 3.1 仪轨列表
```
GET /api/content/ritual/list?category=daily&level=beginner
```

**查询参数:**
- `category`: 分类（daily | weekly | special）
- `level`: 难度（beginner | intermediate | advanced）

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "rituals": [
      {
        "ritualId": "...",
        "title": "晨间感恩仪轨",
        "description": "通过感恩练习...",
        "category": "daily",
        "level": "beginner",
        "steps": 4,
        "estimatedDuration": 10,
        "coverImage": "...",
        "instructor": "清如导师",
        "learnCount": 0,
        "likeCount": 0,
        "order": 1,
        "status": "published"
      }
    ]
  }
}
```

---

### 3.2 仪轨详情
```
GET /api/content/ritual/:id
```

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "ritualId": "...",
    "title": "晨间感恩仪轨",
    "description": "...",
    "category": "daily",
    "level": "beginner",
    "steps": [
      {
        "order": 1,
        "title": "静心准备",
        "description": "找一个安静的地方，深呼吸 3 次"
      }
    ],
    "estimatedDuration": 10,
    "coverImage": "...",
    "instructor": "清如导师",
    "learnCount": 1,
    "likeCount": 0,
    "status": "published",
    "createdAt": "..."
  }
}
```

---

### 3.3 更新学习进度
```
POST /api/content/ritual/progress
Authorization: Bearer <token>
```

**请求体:**
```json
{
  "ritualId": "...",
  "currentStep": 2,
  "completed": false
}
```

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "进度已更新",
  "data": {
    "ritualId": "...",
    "currentStep": 2,
    "completed": false,
    "updatedAt": "2026-03-30T13:00:00.000Z"
  }
}
```

---

### 3.4 用户学习统计
```
GET /api/content/ritual/stats
Authorization: Bearer <token>
```

**响应:**
```json
{
  "code": "SUCCESS",
  "message": "获取成功",
  "data": {
    "totalRituals": 5,
    "completedRituals": 3,
    "inProgressRituals": 2,
    "completionRate": 60,
    "recentWeekCount": 4,
    "lastLearnedAt": "2026-03-30T10:00:00.000Z",
    "recentProgress": [...]
  }
}
```

---

## 4. 云函数

### 4.1 getWikiContent
获取百科内容（小程序端使用）

**参数:**
- `wikiId`: 内容 ID（获取单个）
- `category`: 分类（获取列表）
- `page`: 页码
- `pageSize`: 每页数量

---

### 4.2 recordMeditation
记录冥想完成（小程序端使用）

**参数:**
- `courseId`: 课程 ID
- `duration`: 冥想时长（分钟）

---

### 4.3 recordRitualProgress
记录仪轨学习进度（小程序端使用）

**参数:**
- `ritualId`: 仪轨 ID
- `currentStep`: 当前步骤
- `completed`: 是否完成

---

## 5. 数据库集合

- `wiki_contents`: 百科内容
- `meditation_courses`: 冥想课程
- `meditation_records`: 冥想记录
- `ritual_contents`: 仪轨内容
- `ritual_progress`: 学习进度

---

## 6. 部署说明

### 6.1 数据库初始化
```bash
cd /root/.openclaw/workspace/projects/clearspring-v2
node database/init-phase2.js
```

### 6.2 启动 API 服务器
```bash
cd /root/.openclaw/workspace/projects/clearspring-v2/api
npm start
```

### 6.3 云函数部署
在微信云开发控制台部署以下云函数：
- `getWikiContent`
- `recordMeditation`
- `recordRitualProgress`

---

## 7. 接口总数

- **内容管理 API**: 4 个
- **冥想模块 API**: 4 个
- **仪轨学习 API**: 4 个
- **云函数**: 3 个

**总计**: 15 个接口

---

**版本**: v2.0  
**更新日期**: 2026-03-30
