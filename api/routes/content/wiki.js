/**
 * 管理端 - 百科内容管理接口
 * 用于 admin-pc 管理后台
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const { ObjectId } = require('mongodb');

/**
 * 管理员权限中间件
 */
const adminMiddleware = async (req, res, next) => {
  try {
    await authMiddleware(req, res, () => {});
    
    if (req.user.role !== 'admin') {
      throw new AppError('权限不足，需要管理员权限', 'FORBIDDEN', 403);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/content/admin/wiki/create
 * 创建百科内容
 * Body: title, category, content, tags, coverImage, status
 */
router.post('/create', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { title, category, content, tags, coverImage, status = 'draft' } = req.body;
    
    // 验证必填字段
    if (!title || !content) {
      throw new AppError('标题和内容不能为空', 'INVALID_PARAMS', 400);
    }
    
    // 检查标题是否重复
    const existing = await db.collection('wiki_contents').findOne({ title });
    if (existing) {
      throw new AppError('标题已存在', 'TITLE_EXISTS', 400);
    }
    
    const now = new Date();
    const wikiData = {
      title,
      category: category || 'general',
      content,
      tags: tags || [],
      coverImage: coverImage || '',
      status, // draft, published, archived
      viewCount: 0,
      likeCount: 0,
      createdBy: req.user.userId,
      updatedBy: req.user.userId,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection('wiki_contents').insertOne(wikiData);
    
    res.status(201).json({
      code: 'SUCCESS',
      message: '创建成功',
      data: {
        wikiId: result.insertedId.toString(),
        title,
        status,
        createdAt: now
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/content/admin/wiki/:id
 * 更新百科内容
 * Body: title, category, content, tags, coverImage, status
 */
router.put('/:id', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const wikiId = req.params.id;
    const { title, category, content, tags, coverImage, status } = req.body;
    
    // 检查内容是否存在
    const existing = await db.collection('wiki_contents').findOne({
      _id: new ObjectId(wikiId)
    });
    
    if (!existing) {
      throw new AppError('内容不存在', 'NOT_FOUND', 404);
    }
    
    // 如果修改标题，检查是否重复
    if (title && title !== existing.title) {
      const duplicate = await db.collection('wiki_contents').findOne({ 
        title,
        _id: { $ne: new ObjectId(wikiId) }
      });
      if (duplicate) {
        throw new AppError('标题已存在', 'TITLE_EXISTS', 400);
      }
    }
    
    const updateData = {
      updatedAt: new Date(),
      updatedBy: req.user.userId
    };
    
    if (title) updateData.title = title;
    if (category) updateData.category = category;
    if (content) updateData.content = content;
    if (tags) updateData.tags = tags;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (status) updateData.status = status;
    
    await db.collection('wiki_contents').updateOne(
      { _id: new ObjectId(wikiId) },
      { $set: updateData }
    );
    
    res.json({
      code: 'SUCCESS',
      message: '更新成功',
      data: {
        wikiId,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/content/admin/wiki/:id
 * 删除百科内容
 */
router.delete('/:id', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const wikiId = req.params.id;
    
    // 检查内容是否存在
    const existing = await db.collection('wiki_contents').findOne({
      _id: new ObjectId(wikiId)
    });
    
    if (!existing) {
      throw new AppError('内容不存在', 'NOT_FOUND', 404);
    }
    
    await db.collection('wiki_contents').deleteOne({
      _id: new ObjectId(wikiId)
    });
    
    res.json({
      code: 'SUCCESS',
      message: '删除成功',
      data: {
        wikiId,
        title: existing.title,
        deletedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/admin/wiki/list
 * 百科内容列表（分页/筛选）
 * 查询参数：page, pageSize, category, status, keyword
 */
router.get('/list', adminMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const {
      page = 1,
      pageSize = 20,
      category,
      status,
      keyword
    } = req.query;
    
    // 构建查询条件
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (keyword) {
      const keywordRegex = new RegExp(keyword, 'i');
      query.$or = [
        { title: keywordRegex },
        { content: keywordRegex }
      ];
    }
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // 查询列表
    const items = await db.collection('wiki_contents')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 统计总数
    const total = await db.collection('wiki_contents').countDocuments(query);
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        items: items.map(item => ({
          wikiId: item._id.toString(),
          title: item.title,
          category: item.category,
          status: item.status,
          viewCount: item.viewCount,
          likeCount: item.likeCount,
          tags: item.tags,
          coverImage: item.coverImage,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        })),
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
