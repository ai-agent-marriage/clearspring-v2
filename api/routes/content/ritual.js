/**
 * 仪轨学习 API
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const { ObjectId } = require('mongodb');

/**
 * GET /api/content/ritual/list
 * 仪轨列表
 * 查询参数：category, level
 */
router.get('/list', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { category, level } = req.query;
    
    // 构建查询条件
    const query = { status: 'published' };
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.level = level;
    }
    
    // 查询仪轨列表
    const rituals = await db.collection('ritual_contents')
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .toArray();
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        rituals: rituals.map(ritual => ({
          ritualId: ritual._id.toString(),
          title: ritual.title,
          description: ritual.description,
          category: ritual.category,
          level: ritual.level, // beginner, intermediate, advanced
          steps: ritual.steps?.length || 0,
          estimatedDuration: ritual.estimatedDuration, // 分钟
          coverImage: ritual.coverImage,
          instructor: ritual.instructor,
          learnCount: ritual.learnCount || 0,
          likeCount: ritual.likeCount || 0,
          order: ritual.order || 0,
          status: ritual.status
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/ritual/:id
 * 仪轨详情
 */
router.get('/:id', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const ritualId = req.params.id;
    
    const ritual = await db.collection('ritual_contents').findOne({
      _id: new ObjectId(ritualId)
    });
    
    if (!ritual) {
      throw new AppError('仪轨不存在', 'NOT_FOUND', 404);
    }
    
    // 增加学习次数
    await db.collection('ritual_contents').updateOne(
      { _id: new ObjectId(ritualId) },
      { $inc: { learnCount: 1 } }
    );
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        ritualId: ritual._id.toString(),
        title: ritual.title,
        description: ritual.description,
        category: ritual.category,
        level: ritual.level,
        steps: ritual.steps || [],
        estimatedDuration: ritual.estimatedDuration,
        coverImage: ritual.coverImage,
        instructor: ritual.instructor,
        learnCount: ritual.learnCount || 0,
        likeCount: ritual.likeCount || 0,
        status: ritual.status,
        createdAt: ritual.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/content/ritual/progress
 * 更新学习进度
 * Body: ritualId, currentStep, completed (是否完成)
 */
router.post('/progress', authMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { ritualId, currentStep, completed = false } = req.body;
    
    if (!ritualId) {
      throw new AppError('仪轨 ID 不能为空', 'INVALID_PARAMS', 400);
    }
    
    // 检查仪轨是否存在
    const ritual = await db.collection('ritual_contents').findOne({
      _id: new ObjectId(ritualId)
    });
    
    if (!ritual) {
      throw new AppError('仪轨不存在', 'NOT_FOUND', 404);
    }
    
    const now = new Date();
    
    // 查询是否已有进度记录
    const existingProgress = await db.collection('ritual_progress').findOne({
      userId: req.user.userId,
      ritualId: new ObjectId(ritualId)
    });
    
    let progressData;
    
    if (existingProgress) {
      // 更新已有进度
      const updateData = {
        updatedAt: now,
        currentStep: currentStep !== undefined ? currentStep : existingProgress.currentStep
      };
      
      if (completed) {
        updateData.completed = true;
        updateData.completedAt = now;
        
        // 如果之前未完成，现在完成，增加完成次数
        if (!existingProgress.completed) {
          await db.collection('ritual_contents').updateOne(
            { _id: new ObjectId(ritualId) },
            { $inc: { completedCount: 1 } }
          );
        }
      }
      
      await db.collection('ritual_progress').updateOne(
        { _id: existingProgress._id },
        { $set: updateData }
      );
      
      progressData = {
        ritualId,
        currentStep: updateData.currentStep,
        completed: updateData.completed,
        updatedAt: now
      };
    } else {
      // 创建新进度记录
      progressData = {
        userId: req.user.userId,
        ritualId: new ObjectId(ritualId),
        ritualTitle: ritual.title,
        currentStep: currentStep || 0,
        completed: completed,
        completedAt: completed ? now : null,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await db.collection('ritual_progress').insertOne(progressData);
      
      progressData = {
        ritualId,
        progressId: result.insertedId.toString(),
        currentStep: progressData.currentStep,
        completed: progressData.completed,
        createdAt: now
      };
      
      // 如果是首次完成，增加仪轨完成次数
      if (completed) {
        await db.collection('ritual_contents').updateOne(
          { _id: new ObjectId(ritualId) },
          { $inc: { completedCount: 1 } }
        );
      }
    }
    
    res.status(201).json({
      code: 'SUCCESS',
      message: completed ? '恭喜完成！' : '进度已更新',
      data: progressData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/ritual/stats
 * 用户学习统计
 */
router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.userId;
    
    // 总学习仪轨数
    const totalRituals = await db.collection('ritual_progress')
      .countDocuments({ userId });
    
    // 已完成仪轨数
    const completedRituals = await db.collection('ritual_progress')
      .countDocuments({ userId, completed: true });
    
    // 进行中仪轨数
    const inProgressRituals = totalRituals - completedRituals;
    
    // 获取学习进度详情
    const progressList = await db.collection('ritual_progress')
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .toArray();
    
    // 最近 7 天学习记录
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentWeekProgress = await db.collection('ritual_progress')
      .find({ 
        userId,
        updatedAt: { $gte: sevenDaysAgo }
      })
      .sort({ updatedAt: -1 })
      .toArray();
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        totalRituals,
        completedRituals,
        inProgressRituals,
        completionRate: totalRituals > 0 ? Math.round((completedRituals / totalRituals) * 100) : 0,
        recentWeekCount: recentWeekProgress.length,
        lastLearnedAt: progressList.length > 0 ? progressList[0].updatedAt : null,
        recentProgress: progressList.map(p => ({
          ritualId: p.ritualId.toString(),
          ritualTitle: p.ritualTitle,
          currentStep: p.currentStep,
          completed: p.completed,
          updatedAt: p.updatedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
