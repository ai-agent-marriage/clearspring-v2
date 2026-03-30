/**
 * 冥想模块 API
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');
const { ObjectId } = require('mongodb');

/**
 * GET /api/content/meditation/courses
 * 冥想课程列表
 * 查询参数：category, level, duration
 */
router.get('/courses', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { category, level, duration } = req.query;
    
    // 构建查询条件
    const query = { status: 'published' };
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.level = level;
    }
    
    if (duration) {
      query.duration = parseInt(duration);
    }
    
    // 查询课程列表
    const courses = await db.collection('meditation_courses')
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .toArray();
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        courses: courses.map(course => ({
          courseId: course._id.toString(),
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level, // beginner, intermediate, advanced
          duration: course.duration, // 分钟
          audioUrl: course.audioUrl,
          coverImage: course.coverImage,
          instructor: course.instructor,
          playCount: course.playCount || 0,
          likeCount: course.likeCount || 0,
          order: course.order || 0,
          status: course.status
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/meditation/course/:id
 * 课程详情
 */
router.get('/course/:id', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const courseId = req.params.id;
    
    const course = await db.collection('meditation_courses').findOne({
      _id: new ObjectId(courseId)
    });
    
    if (!course) {
      throw new AppError('课程不存在', 'NOT_FOUND', 404);
    }
    
    // 增加播放次数
    await db.collection('meditation_courses').updateOne(
      { _id: new ObjectId(courseId) },
      { $inc: { playCount: 1 } }
    );
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        courseId: course._id.toString(),
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        audioUrl: course.audioUrl,
        coverImage: course.coverImage,
        instructor: course.instructor,
        playCount: course.playCount || 0,
        likeCount: course.likeCount || 0,
        status: course.status,
        createdAt: course.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/content/meditation/record
 * 记录冥想完成
 * Body: courseId, duration (实际冥想时长，分钟)
 */
router.post('/record', authMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { courseId, duration } = req.body;
    
    if (!courseId || !duration) {
      throw new AppError('课程 ID 和时长不能为空', 'INVALID_PARAMS', 400);
    }
    
    // 检查课程是否存在
    const course = await db.collection('meditation_courses').findOne({
      _id: new ObjectId(courseId)
    });
    
    if (!course) {
      throw new AppError('课程不存在', 'NOT_FOUND', 404);
    }
    
    const now = new Date();
    const record = {
      userId: req.user.userId,
      courseId: new ObjectId(courseId),
      courseTitle: course.title,
      duration: parseInt(duration),
      completedAt: now,
      createdAt: now
    };
    
    const result = await db.collection('meditation_records').insertOne(record);
    
    res.status(201).json({
      code: 'SUCCESS',
      message: '记录成功',
      data: {
        recordId: result.insertedId.toString(),
        courseId,
        duration,
        completedAt: now
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/meditation/stats
 * 用户冥想统计
 */
router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.userId;
    
    // 总冥想次数
    const totalCount = await db.collection('meditation_records')
      .countDocuments({ userId });
    
    // 总冥想时长（分钟）
    const totalDurationResult = await db.collection('meditation_records')
      .aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$duration' } } }
      ])
      .toArray();
    
    const totalDuration = totalDurationResult.length > 0 ? totalDurationResult[0].total : 0;
    
    // 连续冥想天数
    const recentRecords = await db.collection('meditation_records')
      .find({ userId })
      .sort({ completedAt: -1 })
      .limit(365)
      .toArray();
    
    let streakDays = 0;
    if (recentRecords.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDate = new Date(recentRecords[0].completedAt);
      currentDate.setHours(0, 0, 0, 0);
      
      if (currentDate.getTime() === today.getTime() || 
          currentDate.getTime() === today.getTime() - 86400000) {
        streakDays = 1;
        
        for (let i = 1; i < recentRecords.length; i++) {
          const recordDate = new Date(recentRecords[i].completedAt);
          recordDate.setHours(0, 0, 0, 0);
          
          const expectedDate = new Date(currentDate);
          expectedDate.setDate(expectedDate.getDate() - 1);
          
          if (recordDate.getTime() === expectedDate.getTime()) {
            streakDays++;
            currentDate = recordDate;
          } else if (recordDate.getTime() < expectedDate.getTime()) {
            break;
          }
        }
      }
    }
    
    // 最近 7 天冥想记录
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentWeekRecords = await db.collection('meditation_records')
      .find({ 
        userId,
        completedAt: { $gte: sevenDaysAgo }
      })
      .sort({ completedAt: -1 })
      .toArray();
    
    res.json({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        totalCount,
        totalDuration, // 分钟
        streakDays,
        recentWeekCount: recentWeekRecords.length,
        lastCompletedAt: recentRecords.length > 0 ? recentRecords[0].completedAt : null
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
