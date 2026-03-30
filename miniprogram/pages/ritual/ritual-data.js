// 放生仪轨数据
const ritualData = {
  categories: [
    { id: 'simple', name: '简单仪轨', icon: '📿' },
    { id: 'complete', name: '完整仪轨', icon: '📖' },
    { id: 'special', name: '专项仪轨', icon: '🎯' }
  ],
  
  rituals: [
    // 简单仪轨 (5 个)
    {
      id: 'simple-1',
      category: 'simple',
      title: '简易放生仪轨',
      duration: 10,
      difficulty: 'easy',
      learnCount: 12580,
      steps: [
        {
          title: '发心',
          content: '为利益一切众生而放生，愿众生离苦得乐，究竟成佛。',
          audio: 'simple-1-step1.mp3',
          duration: 60
        },
        {
          title: '三皈依',
          content: '皈依佛，皈依法，皈依僧。\n皈依佛竟，皈依法竟，皈依僧竟。',
          audio: 'simple-1-step2.mp3',
          duration: 90
        },
        {
          title: '忏悔',
          content: '往昔所造诸恶业，皆由无始贪嗔痴，\n从身语意之所生，一切我今皆忏悔。',
          audio: 'simple-1-step3.mp3',
          duration: 60
        },
        {
          title: '放生',
          content: '诸佛子等，此南方大士解脱者，能雨无量无边法雨，\n能除汝等一切热恼，能令汝等究竟清凉。',
          audio: 'simple-1-step4.mp3',
          duration: 120
        },
        {
          title: '回向',
          content: '放生功德殊胜行，无边胜福皆回向，\n普愿沉溺诸众生，速往无量光佛刹。',
          audio: 'simple-1-step5.mp3',
          duration: 60
        }
      ]
    },
    {
      id: 'simple-2',
      category: 'simple',
      title: '三皈依仪轨',
      duration: 8,
      difficulty: 'easy',
      learnCount: 9860,
      steps: [
        {
          title: '请师',
          content: '恭请大德法师为众生授三皈依。',
          audio: 'simple-2-step1.mp3',
          duration: 30
        },
        {
          title: '忏悔',
          content: '弟子众等，从无始来，造诸恶业，\n今于佛前，求哀忏悔。',
          audio: 'simple-2-step2.mp3',
          duration: 60
        },
        {
          title: '正授三皈',
          content: '皈依佛，皈依法，皈依僧。\n皈依佛竟，皈依法竟，皈依僧竟。',
          audio: 'simple-2-step3.mp3',
          duration: 120
        },
        {
          title: '发愿',
          content: '众生无边誓愿度，烦恼无尽誓愿断，\n法门无量誓愿学，佛道无上誓愿成。',
          audio: 'simple-2-step4.mp3',
          duration: 60
        },
        {
          title: '回向',
          content: '愿以此功德，普及于一切，\n我等与众生，皆共成佛道。',
          audio: 'simple-2-step5.mp3',
          duration: 30
        }
      ]
    },
    {
      id: 'simple-3',
      category: 'simple',
      title: '忏悔仪轨',
      duration: 12,
      difficulty: 'easy',
      learnCount: 7650,
      steps: [
        {
          title: '礼拜',
          content: '至心顶礼十方三世一切诸佛。',
          audio: 'simple-3-step1.mp3',
          duration: 60
        },
        {
          title: '发露',
          content: '弟子众等，从无始以来，贪嗔痴心，\n造诸恶业，今皆发露，不敢覆藏。',
          audio: 'simple-3-step2.mp3',
          duration: 90
        },
        {
          title: '忏悔',
          content: '往昔所造诸恶业，皆由无始贪嗔痴，\n从身语意之所生，一切我今皆忏悔。',
          audio: 'simple-3-step3.mp3',
          duration: 120
        },
        {
          title: '发愿',
          content: '从今以后，誓不再造诸恶业，\n勤修戒定慧，息灭贪嗔痴。',
          audio: 'simple-3-step4.mp3',
          duration: 60
        },
        {
          title: '回向',
          content: '忏悔功德殊胜行，无边胜福皆回向。',
          audio: 'simple-3-step5.mp3',
          duration: 30
        }
      ]
    },
    {
      id: 'simple-4',
      category: 'simple',
      title: '回向仪轨',
      duration: 5,
      difficulty: 'easy',
      learnCount: 11200,
      steps: [
        {
          title: '总回向',
          content: '愿以此功德，庄严佛净土，\n上报四重恩，下济三途苦。',
          audio: 'simple-4-step1.mp3',
          duration: 60
        },
        {
          title: '普回向',
          content: '若有见闻者，悉发菩提心，\n尽此一报身，同生极乐国。',
          audio: 'simple-4-step2.mp3',
          duration: 60
        },
        {
          title: '别回向',
          content: '愿将此功德，回向给所有被放生的众生，\n愿它们离苦得乐，往生善道。',
          audio: 'simple-4-step3.mp3',
          duration: 60
        },
        {
          title: '个人回向',
          content: '愿将此功德，回向给弟子及家人，\n业障消除，福慧增长。',
          audio: 'simple-4-step4.mp3',
          duration: 60
        },
        {
          title: '圆满',
          content: '放生功德圆满，普皆回向。',
          audio: 'simple-4-step5.mp3',
          duration: 30
        }
      ]
    },
    {
      id: 'simple-5',
      category: 'simple',
      title: '发愿仪轨',
      duration: 6,
      difficulty: 'easy',
      learnCount: 8900,
      steps: [
        {
          title: '发菩提心',
          content: '为利众生愿成佛，为度众生发菩提。',
          audio: 'simple-5-step1.mp3',
          duration: 60
        },
        {
          title: '四弘誓愿',
          content: '众生无边誓愿度，烦恼无尽誓愿断，\n法门无量誓愿学，佛道无上誓愿成。',
          audio: 'simple-5-step2.mp3',
          duration: 90
        },
        {
          title: '放生愿',
          content: '愿我常行放生，救护一切众生，\n令其离苦得乐，究竟解脱。',
          audio: 'simple-5-step3.mp3',
          duration: 60
        },
        {
          title: '坚固愿',
          content: '此愿坚固，如金刚山，\n任何违缘，不能动摇。',
          audio: 'simple-5-step4.mp3',
          duration: 60
        },
        {
          title: '圆满',
          content: '发愿功德，普皆回向。',
          audio: 'simple-5-step5.mp3',
          duration: 30
        }
      ]
    },
    
    // 完整仪轨 (5 个)
    {
      id: 'complete-1',
      category: 'complete',
      title: '完整放生仪轨',
      duration: 30,
      difficulty: 'medium',
      learnCount: 6540,
      steps: [
        {
          title: '香赞',
          content: '炉香乍爇，法界蒙熏，\n诸佛海会悉遥闻，随处结祥云。',
          audio: 'complete-1-step1.mp3',
          duration: 120
        },
        {
          title: '净口业真言',
          content: '唵 修利修利 摩诃修利 修修利 萨婆诃',
          audio: 'complete-1-step2.mp3',
          duration: 30
        },
        {
          title: '净身业真言',
          content: '唵 修多利 修多利 修摩利 修摩利 萨婆诃',
          audio: 'complete-1-step3.mp3',
          duration: 30
        },
        {
          title: '净意业真言',
          content: '唵 嚩日啰怛诃贺斛',
          audio: 'complete-1-step4.mp3',
          duration: 30
        },
        {
          title: '安土地真言',
          content: '南无三满哆 母驮喃 唵 度噜度噜 地尾萨婆诃',
          audio: 'complete-1-step5.mp3',
          duration: 30
        },
        {
          title: '普供养真言',
          content: '唵 誐誐曩 三婆嚩 伐日啰斛',
          audio: 'complete-1-step6.mp3',
          duration: 30
        },
        {
          title: '皈依',
          content: '皈依佛，皈依法，皈依僧。\n皈依佛竟，皈依法竟，皈依僧竟。',
          audio: 'complete-1-step7.mp3',
          duration: 90
        },
        {
          title: '发心',
          content: '为利众生愿成佛，为度众生发菩提。',
          audio: 'complete-1-step8.mp3',
          duration: 60
        },
        {
          title: '忏悔',
          content: '往昔所造诸恶业，皆由无始贪嗔痴，\n从身语意之所生，一切我今皆忏悔。',
          audio: 'complete-1-step9.mp3',
          duration: 90
        },
        {
          title: '放生',
          content: '诸佛子等，此南方大士解脱者，\n能雨无量无边法雨，能除汝等一切热恼。',
          audio: 'complete-1-step10.mp3',
          duration: 180
        },
        {
          title: '念佛',
          content: '南无宝髻如来\n南无阿弥陀佛\n南无观世音菩萨',
          audio: 'complete-1-step11.mp3',
          duration: 180
        },
        {
          title: '回向',
          content: '放生功德殊胜行，无边胜福皆回向，\n普愿沉溺诸众生，速往无量光佛刹。',
          audio: 'complete-1-step12.mp3',
          duration: 90
        }
      ]
    },
    {
      id: 'complete-2',
      category: 'complete',
      title: '药师佛放生仪轨',
      duration: 35,
      difficulty: 'medium',
      learnCount: 4320,
      steps: [
        {
          title: '香赞',
          content: '炉香乍爇，法界蒙熏，\n诸佛海会悉遥闻，随处结祥云。',
          audio: 'complete-2-step1.mp3',
          duration: 120
        },
        {
          title: '称圣号',
          content: '南无消灾延寿药师佛',
          audio: 'complete-2-step2.mp3',
          duration: 60
        },
        {
          title: '药师咒',
          content: '南无薄伽伐帝 鞞杀社 噜薜琉璃 钵喇婆 喝啰阇也\n怛他揭多也 阿啰喝帝 三藐三勃陀也',
          audio: 'complete-2-step3.mp3',
          duration: 120
        },
        {
          title: '十二大愿',
          content: '第一大愿：愿我来世得阿耨多罗三藐三菩提时，\n自身光明炽然，照耀无量无数无边世界。',
          audio: 'complete-2-step4.mp3',
          duration: 180
        },
        {
          title: '皈依',
          content: '皈依佛，皈依法，皈依僧。',
          audio: 'complete-2-step5.mp3',
          duration: 90
        },
        {
          title: '放生',
          content: '愿诸众生，永离病苦，\n健康长寿，究竟安乐。',
          audio: 'complete-2-step6.mp3',
          duration: 120
        },
        {
          title: '念佛',
          content: '南无药师琉璃光如来',
          audio: 'complete-2-step7.mp3',
          duration: 180
        },
        {
          title: '回向',
          content: '愿以此功德，回向法界众生，\n消灾延寿，福慧圆满。',
          audio: 'complete-2-step8.mp3',
          duration: 90
        }
      ]
    },
    {
      id: 'complete-3',
      category: 'complete',
      title: '观音菩萨放生仪轨',
      duration: 32,
      difficulty: 'medium',
      learnCount: 5670,
      steps: [
        {
          title: '香赞',
          content: '观音大士，悉号圆通，\n十二大愿誓弘深，苦海渡迷津。',
          audio: 'complete-3-step1.mp3',
          duration: 120
        },
        {
          title: '称圣号',
          content: '南无大慈大悲救苦救难观世音菩萨',
          audio: 'complete-3-step2.mp3',
          duration: 60
        },
        {
          title: '大悲咒',
          content: '南无喝啰怛那哆啰夜耶 南无阿唎耶...',
          audio: 'complete-3-step3.mp3',
          duration: 300
        },
        {
          title: '皈依',
          content: '皈依佛，皈依法，皈依僧。',
          audio: 'complete-3-step4.mp3',
          duration: 90
        },
        {
          title: '放生',
          content: '愿诸众生，离苦得乐，\n观音菩萨，慈悲救度。',
          audio: 'complete-3-step5.mp3',
          duration: 120
        },
        {
          title: '念佛',
          content: '南无观世音菩萨',
          audio: 'complete-3-step6.mp3',
          duration: 180
        },
        {
          title: '回向',
          content: '愿以此功德，回向法界众生，\n离苦得乐，往生净土。',
          audio: 'complete-3-step7.mp3',
          duration: 90
        }
      ]
    },
    {
      id: 'complete-4',
      category: 'complete',
      title: '地藏菩萨放生仪轨',
      duration: 35,
      difficulty: 'medium',
      learnCount: 4890,
      steps: [
        {
          title: '香赞',
          content: '地藏大士，誓愿弘深，\n明珠照破铁围城，金锡振幽冥。',
          audio: 'complete-4-step1.mp3',
          duration: 120
        },
        {
          title: '称圣号',
          content: '南无大愿地藏王菩萨',
          audio: 'complete-4-step2.mp3',
          duration: 60
        },
        {
          title: '地藏赞',
          content: '地藏菩萨妙难伦，化现金容处处分，\n三途六道闻妙法，四生十类蒙慈恩。',
          audio: 'complete-4-step3.mp3',
          duration: 120
        },
        {
          title: '皈依',
          content: '皈依佛，皈依法，皈依僧。',
          audio: 'complete-4-step4.mp3',
          duration: 90
        },
        {
          title: '放生',
          content: '愿诸众生，不堕恶趣，\n地藏菩萨，慈悲救拔。',
          audio: 'complete-4-step5.mp3',
          duration: 120
        },
        {
          title: '念佛',
          content: '南无地藏王菩萨',
          audio: 'complete-4-step6.mp3',
          duration: 180
        },
        {
          title: '回向',
          content: '愿以此功德，回向法界众生，\n不堕恶道，往生善趣。',
          audio: 'complete-4-step7.mp3',
          duration: 90
        }
      ]
    },
    {
      id: 'complete-5',
      category: 'complete',
      title: '阿弥陀佛放生仪轨',
      duration: 30,
      difficulty: 'medium',
      learnCount: 7230,
      steps: [
        {
          title: '香赞',
          content: '弥陀佛大愿无边，接引众生往西方，\n九品莲华为父母，花开见佛悟无生。',
          audio: 'complete-5-step1.mp3',
          duration: 120
        },
        {
          title: '称圣号',
          content: '南无阿弥陀佛',
          audio: 'complete-5-step2.mp3',
          duration: 60
        },
        {
          title: '阿弥陀经',
          content: '如是我闻，一时佛在舍卫国，祇树给孤独园...',
          audio: 'complete-5-step3.mp3',
          duration: 300
        },
        {
          title: '皈依',
          content: '皈依佛，皈依法，皈依僧。',
          audio: 'complete-5-step4.mp3',
          duration: 90
        },
        {
          title: '放生',
          content: '愿诸众生，往生极乐，\n阿弥陀佛，慈悲接引。',
          audio: 'complete-5-step5.mp3',
          duration: 120
        },
        {
          title: '念佛',
          content: '南无阿弥陀佛',
          audio: 'complete-5-step6.mp3',
          duration: 180
        },
        {
          title: '回向',
          content: '愿以此功德，回向法界众生，\n往生极乐，究竟成佛。',
          audio: 'complete-5-step7.mp3',
          duration: 90
        }
      ]
    },
    
    // 专项仪轨 (5 个)
    {
      id: 'special-1',
      category: 'special',
      title: '放生鱼类仪轨',
      duration: 20,
      difficulty: 'easy',
      learnCount: 8760,
      steps: [
        {
          title: '发心',
          content: '为救度水族众生而放生，愿鱼类众生离苦得乐。',
          audio: 'special-1-step1.mp3',
          duration: 60
        },
        {
          title: '皈依',
          content: '皈依佛，皈依法，皈依僧。\n皈依佛竟，皈依法竟，皈依僧竟。',
          audio: 'special-1-step2.mp3',
          duration: 90
        },
        {
          title: '念佛',
          content: '南无宝髻如来\n南无阿弥陀佛',
          audio: 'special-1-step3.mp3',
          duration: 120
        },
        {
          title: '放生',
          content: '诸佛子等，此水清凉，能除热恼，\n愿汝等得生善处，永离网捕。',
          audio: 'special-1-step4.mp3',
          duration: 120
        },
        {
          title: '回向',
          content: '愿此鱼类众生，往生善道，\n永离杀劫，究竟解脱。',
          audio: 'special-1-step5.mp3',
          duration: 60
        }
      ]
    },
    {
      id: 'special-2',
      category: 'special',
      title: '放生鸟类仪轨',
      duration: 18,
      difficulty: 'easy',
      learnCount: 7450,
      steps: [
        {
          title: '发心',
          content: '为救度飞禽众生而放生，愿鸟类众生自由翱翔。',
          audio: 'special-2-step1.mp3',
          duration: 60
        },
        {
          title: '皈依',
          content: '皈依佛，皈依法，皈依僧。\n皈依佛竟，皈依法竟，皈依僧竟。',
          audio: 'special-2-step2.mp3',
          duration: 90
        },
        {
          title: '念佛',
          content: '南无宝髻如来\n南无阿弥陀佛',
          audio: 'special-2-step3.mp3',
          duration: 120
        },
        {
          title: '放生',
          content: '诸佛子等，此天空阔，任汝飞翔，\n愿汝等得生善处，永离罗网。',
          audio: 'special-2-step4.mp3',
          duration: 120
        },
        {
          title: '回向',
          content: '愿此鸟类众生，自由飞翔，\n永离捕猎，究竟解脱。',
          audio: 'special-2-step5.mp3',
          duration: 60
        }
      ]
    },
    {
      id: 'special-3',
      category: 'special',
      title: '放生动物仪轨',
      duration: 22,
      difficulty: 'easy',
      learnCount: 6890,
      steps: [
        {
          title: '发心',
          content: '为救度陆生动物而放生，愿一切众生离苦得乐。',
          audio: 'special-3-step1.mp3',
          duration: 60
        },
        {
          title: '皈依',
          content: '皈依佛，皈依法，皈依僧。\n皈依佛竟，皈依法竟，皈依僧竟。',
          audio: 'special-3-step2.mp3',
          duration: 90
        },
        {
          title: '念佛',
          content: '南无宝髻如来\n南无阿弥陀佛',
          audio: 'special-3-step3.mp3',
          duration: 120
        },
        {
          title: '放生',
          content: '诸佛子等，此地安稳，任汝生活，\n愿汝等得生善处，永离屠刀。',
          audio: 'special-3-step4.mp3',
          duration: 120
        },
        {
          title: '回向',
          content: '愿此动物众生，安居乐业，\n永离杀害，究竟解脱。',
          audio: 'special-3-step5.mp3',
          duration: 60
        }
      ]
    },
    {
      id: 'special-4',
      category: 'special',
      title: '超度仪轨',
      duration: 25,
      difficulty: 'medium',
      learnCount: 5430,
      steps: [
        {
          title: '发心',
          content: '为超度亡灵而放生，愿亡者往生善道。',
          audio: 'special-4-step1.mp3',
          duration: 60
        },
        {
          title: '称名',
          content: '南无地藏王菩萨\n南无阿弥陀佛',
          audio: 'special-4-step2.mp3',
          duration: 90
        },
        {
          title: '往生咒',
          content: '南无阿弥多婆夜 哆他伽多夜...',
          audio: 'special-4-step3.mp3',
          duration: 180
        },
        {
          title: '放生',
          content: '愿以此放生功德，超度亡灵，\n往生极乐，离苦得乐。',
          audio: 'special-4-step4.mp3',
          duration: 120
        },
        {
          title: '回向',
          content: '愿以此功德，回向亡灵，\n往生净土，究竟成佛。',
          audio: 'special-4-step5.mp3',
          duration: 60
        }
      ]
    },
    {
      id: 'special-5',
      category: 'special',
      title: '祈福仪轨',
      duration: 20,
      difficulty: 'easy',
      learnCount: 9120,
      steps: [
        {
          title: '发心',
          content: '为祈福消灾而放生，愿众生平安吉祥。',
          audio: 'special-5-step1.mp3',
          duration: 60
        },
        {
          title: '皈依',
          content: '皈依佛，皈依法，皈依僧。\n皈依佛竟，皈依法竟，皈依僧竟。',
          audio: 'special-5-step2.mp3',
          duration: 90
        },
        {
          title: '祈福',
          content: '愿以此放生功德，祈福消灾，\n国泰民安，风调雨顺。',
          audio: 'special-5-step3.mp3',
          duration: 120
        },
        {
          title: '放生',
          content: '诸佛子等，愿汝等得生善处，\n我等亦得福慧增长。',
          audio: 'special-5-step4.mp3',
          duration: 120
        },
        {
          title: '回向',
          content: '愿以此功德，回向法界，\n消灾免难，福寿绵长。',
          audio: 'special-5-step5.mp3',
          duration: 60
        }
      ]
    }
  ]
};

module.exports = ritualData;
