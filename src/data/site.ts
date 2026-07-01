export const profile = {
  name: 'YuNan',
  handle: 'Java Backend Developer',
  location: 'China',
  intro:
    '参与广告投放、批量创建和数数 BI 平台建设，关注第三方媒体接入、批量工作流、分析型 SQL、异步任务和数据一致性。',
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
  { href: '/about/', label: '关于' }
];

export const stackGroups = [
  {
    title: 'Backend',
    items: ['Java', 'Spring Boot', 'Spring Cloud', 'MyBatis', 'Netty']
  },
  {
    title: 'Data',
    items: ['MySQL', 'Redis', 'Elasticsearch', 'Kafka', 'RabbitMQ']
  },
  {
    title: 'Infra',
    items: ['Docker', 'Linux', 'Nginx', 'Prometheus', 'GitHub Actions']
  }
];

export const experiences = [
  {
    year: '2026',
    title: '构建个人技术品牌',
    detail: '持续输出 Java 后端、系统设计、线上问题复盘和工具链实践。'
  },
  {
    year: '2024-2025',
    title: '后端工程与业务系统',
    detail: '负责核心业务接口、异步任务、缓存治理、数据库优化与稳定性建设。'
  },
  {
    year: 'Earlier',
    title: '基础能力积累',
    detail: '从 CRUD 到工程化，逐步补齐 Linux、网络、数据库和分布式系统能力。'
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
