// 数据库导入脚本 - OBU 百科内容
// 使用方法：node database/import-wiki-data.js

const fs = require('fs');
const logger = require('../../utils/logger');

const path = require('path');

const contentDir = path.join(__dirname, '../content/obu-wiki');
const outputFile = path.join(__dirname, 'wiki-data.json');

logger.info('📖 开始导入 OBU 百科内容...\n');

// 读取所有内容文件
const files = fs.readdirSync(contentDir)
  .filter(file => file.endsWith('.json') && file.startsWith('wiki_'))
  .sort();

logger.info(`📁 找到 ${files.length} 个内容文件\n`);

const wikiData = [];

files.forEach(file => {
  const filePath = path.join(contentDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const article = JSON.parse(content);
  wikiData.push(article);
  logger.info(`✅ ${article.id} - ${article.title}`);
});

// 按分类统计
const categoryStats = {};
wikiData.forEach(article => {
  if (!categoryStats[article.category]) {
    categoryStats[article.category] = 0;
  }
  categoryStats[article.category]++;
});

logger.info('\n📊 分类统计:');
Object.entries(categoryStats).forEach(([category, count]) => {
  logger.info(`   ${category}: ${count}篇`);
});

// 写入数据库文件
fs.writeFileSync(outputFile, JSON.stringify(wikiData, null, 2));

logger.info(`\n💾 数据已保存到：${outputFile}`);
logger.info(`\n✨ 导入完成！共 ${wikiData.length} 篇百科内容\n`);

// 导出为模块
module.exports = wikiData;
