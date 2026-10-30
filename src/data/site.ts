export const profile = {
  name: 'YuNan',
  handle: 'Java Backend Developer',
  location: 'China',
  intro:
    'Java 后端开发，参与媒体花费采集、批量投放、BI 路径分析、资产迁移和报表导出；维护个人 AI 网站的模型接入、积分结算与视频任务。开发中使用 AI 辅助，记录具体实现、修复和验证范围。',
  // Leave optional contact fields empty until real public details are available.
  email: '',
  github: 'https://github.com/lxiaonan',
  csdn: 'https://blog.csdn.net/m0_62780474?type=blog',
  linuxdo: '',
  resume: ''
};

export const navItems = [
  { href: '/', label: '首页' },
  { href: '/blog/', label: '文章' },
  { href: '/projects/', label: '项目' },
  { href: '/pitfalls/', label: '踩过的小坑' },
  { href: '/ai-development/', label: 'AI 开发总结' },
  { href: '/ai-skills/', label: 'AI Skills' },
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
    detail: '维护模型配置、聊天 Token 预扣结算、持久化视频任务、任务中心及漫剧预检，修复审计和浏览器存储问题。'
  },
  {
    year: '2026',
    title: 'BI 分析与数据治理',
    detail: '参与路径分析与节点下钻、完整结果分群、资产箱依赖迁移、埋点验收、事件条数比较和飞书表格导出。'
  },
  {
    year: '2025 — 2026',
    title: '广告平台与批量工作流',
    detail: '参与百度 SEM、华为商店等渠道花费采集及 B站素材关系维护；实现和维护快手、B站、广点通批创。'
  }
];

export const capabilities = [
  {
    number: '01',
    title: '批创预览与逐层提交',
    detail: '模板生成本地草稿，提交时按媒体对象层级创建，回写媒体 ID、成功标记和错误原因，维护重提入口。',
    project: '批创平台',
    href: '/projects/batch-creation-platform/'
  },
  {
    number: '02',
    title: '路径查询与资产迁移',
    detail: '路径下钻保存完整用户集合；资产箱区分复用与跳过，按依赖顺序导入并映射目标引用。',
    project: '数数 BI 平台',
    href: '/projects/bi-analytics-platform/'
  },
  {
    number: '03',
    title: '媒体花费与素材关系',
    detail: '核对账号、日期与金额单位；B站创意详情查询对限流和 IO 异常有限重试，并记录跳过的批次。',
    project: '广告投放平台',
    href: '/projects/ad-platform/'
  },
  {
    number: '04',
    title: '积分结算与视频任务',
    detail: '聊天按 usage 结算且不超过预扣；视频任务落库并分开提交、轮询，核对退款、租约和任务归属。',
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
