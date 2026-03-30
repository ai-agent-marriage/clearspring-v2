/**
 * 批量替换 console.log 为 logger
 * 用法：node scripts/replace-console-log.js
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '..');
const EXCLUDE_DIRS = ['node_modules', '.git', 'colorui/node_modules', 'logs', 'exports'];

function shouldExclude(dirPath) {
  return EXCLUDE_DIRS.some(exclude => dirPath.includes(exclude));
}

function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!shouldExclude(filePath)) {
        findJsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') && !file.includes('.bak')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

function replaceConsoleLog(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // 检查是否已经有 logger 引用
  const hasLogger = content.includes("require('winston')") || 
                    content.includes("require('./utils/logger'") ||
                    content.includes("require('../utils/logger'") ||
                    content.includes('require(\'../../utils/logger\'') ||
                    content.includes('logger.');
  
  // 统计 console.log 数量
  const consoleLogCount = (content.match(/console\.log\(/g) || []).length;
  
  if (consoleLogCount === 0) {
    return { filePath, replaced: 0, hasLogger };
  }
  
  // 如果没有 logger 引用，添加
  if (!hasLogger) {
    // 找到第一个 require 语句的位置
    const firstRequireMatch = content.match(/(const \w+ = require\(['"].*?['"]\);)/);
    if (firstRequireMatch) {
      const loggerRequire = "\nconst logger = require('../../utils/logger');\n";
      const insertPos = firstRequireMatch.index + firstRequireMatch[0].length;
      content = content.slice(0, insertPos) + loggerRequire + content.slice(insertPos);
    }
  }
  
  // 替换 console.log 为 logger.info
  content = content.replace(/console\.log\(/g, 'logger.info(');
  
  // 写回文件
  fs.writeFileSync(filePath, content, 'utf8');
  
  return { filePath, replaced: consoleLogCount, hasLogger: true };
}

// 主程序
logger.info('🔍 开始扫描 JavaScript 文件...\n');

const jsFiles = findJsFiles(TARGET_DIR);
logger.info(`📁 找到 ${jsFiles.length} 个 JavaScript 文件\n`);

let totalReplaced = 0;
let filesModified = 0;
let filesWithLogger = 0;

for (const filePath of jsFiles) {
  const result = replaceConsoleLog(filePath);
  
  if (result.replaced > 0) {
    totalReplaced += result.replaced;
    filesModified++;
    logger.info(`✏️  ${path.relative(TARGET_DIR, filePath)}: ${result.replaced} 处替换`);
  }
  
  if (result.hasLogger) {
    filesWithLogger++;
  }
}

logger.info('\n📊 替换完成统计:');
logger.info(`  - 扫描文件：${jsFiles.length}`);
logger.info(`  - 修改文件：${filesModified}`);
logger.info(`  - 替换次数：${totalReplaced}`);
logger.info(`  - 使用 logger: ${filesWithLogger}`);
logger.info('\n✅ 所有 console.log 已替换为 logger.info');
