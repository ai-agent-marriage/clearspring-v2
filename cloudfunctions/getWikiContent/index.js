/**
 * 云函数：getWikiContent
 * 功能：获取百科内容（小程序端使用）
 * 部署环境：微信云开发
 */

const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  
  try {
    const { wikiId, category, page = 1, pageSize = 20 } = event;
    
    // 获取单个内容
    if (wikiId) {
      const result = await db.collection('wiki_contents').where({
        _id: wikiId,
        status: 'published'
      }).get();
      
      if (result.data.length === 0) {
        return {
          code: 'NOT_FOUND',
          message: '内容不存在',
          data: null
        };
      }
      
      const wiki = result.data[0];
      
      // 增加浏览次数
      await db.collection('wiki_contents').doc(wikiId).update({
        data: {
          viewCount: _.inc(1),
          updatedAt: new Date()
        }
      });
      
      return {
        code: 'SUCCESS',
        message: '获取成功',
        data: {
          wikiId: wiki._id,
          title: wiki.title,
          category: wiki.category,
          content: wiki.content,
          coverImage: wiki.coverImage,
          tags: wiki.tags,
          viewCount: (wiki.viewCount || 0) + 1,
          likeCount: wiki.likeCount || 0,
          createdAt: wiki.createdAt,
          updatedAt: wiki.updatedAt
        }
      };
    }
    
    // 获取列表
    let query = db.collection('wiki_contents').where({
      status: 'published'
    });
    
    if (category) {
      query = query.and({
        category
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    
    const result = await query
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(parseInt(pageSize))
      .get();
    
    const total = await query.count();
    
    return {
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        items: result.data.map(item => ({
          wikiId: item._id,
          title: item.title,
          category: item.category,
          coverImage: item.coverImage,
          viewCount: item.viewCount || 0,
          likeCount: item.likeCount || 0,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        })),
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: total.total
        }
      }
    };
  } catch (error) {
    console.error('获取百科内容失败:', error);
    return {
      code: 'GET_WIKI_FAILED',
      message: error.message || '获取失败',
      data: null
    };
  }
};
