export const profile = {
  name: 'YuNan',
  handle: 'Java Backend Developer',
  location: 'China',
  intro:
    '参与广告投放、批创与 BI 平台建设，也在做自己的 AI 创作平台。大量使用 AI 完成代码实现，把精力放在业务拆解、技术取舍、问题定位和交付验证。',
  email: 'hello [at] your-domain.com',
  github: 'https://github.com/lxiaonan',
  csdn: 'https://blog.csdn.net/m0_62780474?type=blog',
  linuxdo: 'https://linux.do/u/yourname',
  resume: ''
};

export const navItems = [
  { href: '/', label: '首页' },
  { href: '/blog/', label: '文章' },
  { href: '/projects/', label: '项目' },
  { href: '/pitfalls/', label: '踩过的小坑' },
  { href: '/ai-development/', label: 'AI 开发总结' },
  { href: '/about/', label: '关于' }
];

export const stackGroups = [
  {
    title: 'Backend',
    items: ['Java 21', 'Spring Boot', 'Spring Cloud', 'MyBatis', 'XXL-Job']
  },
  {
    title: 'Data',
    items: ['StarRocks', 'PostgreSQL', 'MySQL', 'Redis', 'SQL Planner']
  },
  {
    title: 'Product & Delivery',
    items: ['Vue 3', 'TypeScript', 'Linux', 'Nginx', 'AI 协作开发']
  }
];

export const experiences = [
  {
    year: '2026.07 起',
    title: '个人 AI 创作平台',
    detail: '从模型接入扩展到积分计费、异步生成任务、漫剧工作流与部署维护，实践 AI 辅助的全流程交付。'
  },
  {
    year: '2026',
    title: 'BI 分析与数据治理',
    detail: '参与路径与属性分析、标签分群、资产迁移、埋点数据验收和跨平台事件差异告警。'
  },
  {
    year: '2025 — 2026',
    title: '广告平台与批量工作流',
    detail: '参与多媒体渠道鉴权、花费采集、素材关系维护及快手、B站、广点通等批创链路。'
  }
];

export const capabilities = [
  {
    number: '01',
    title: '把业务拆成可交付的流程',
    detail: '将批量投放拆成预览、提交、结果追踪与失败重提，明确每一步的输入、状态和恢复入口。',
    project: '批创平台',
    href: '/projects/batch-creation-platform/'
  },
  {
    number: '02',
    title: '理解数据语义与依赖',
    detail: '从页面分析配置到 SQL 规划，再到资产迁移中的依赖顺序、冲突复用与目标 ID 重映射。',
    project: '数数 BI 平台',
    href: '/projects/bi-analytics-platform/'
  },
  {
    number: '03',
    title: '处理外部系统的不确定性',
    detail: '识别授权失效、接口限流、金额单位和局部失败，让采集与补跑有清楚的边界。',
    project: '广告投放平台',
    href: '/projects/ad-platform/'
  },
  {
    number: '04',
    title: '让 AI 实现接受工程验证',
    detail: '约束模型参数、积分结算与异步任务状态，结合测试和浏览器验收，把修复沉淀成下一次的规范。',
    project: '个人 AI 创作平台',
    href: '/projects/ai-tool-platform/'
  }
];

export const resourceGroups = [
  {
    icon: '⚡',
    title: '我的常用',
    items: [
      {
        name: 'Linux.do',
        description: 'Linux 与开源技术社区',
        href: 'https://linux.do',
        icon: 'LD'
      },
      {
        name: 'GitHub',
        description: '代码托管与开源项目',
        href: 'https://github.com/lxiaonan',
        icon: 'GH'
      },
      {
        name: 'CSDN',
        description: '技术文章与学习记录',
        href: 'https://blog.csdn.net/m0_62780474?type=blog',
        icon: 'CS'
      },
    ]
  },
  {
    icon: '🛠',
    title: '开发工具',
    items: [
      {
        name: 'Spring Initializr',
        description: '快速创建 Spring Boot 项目',
        href: 'https://start.spring.io',
        icon: 'SP'
      },
      {
        name: 'Maven Repository',
        description: 'Java 依赖检索',
        href: 'https://mvnrepository.com',
        icon: 'MV'
      },
      {
        name: 'Cloudflare',
        description: 'DNS、CDN 与 Pages 部署',
        href: 'https://cloudflare.com',
        icon: 'CF'
      }
    ]
  }
];
