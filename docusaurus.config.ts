import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: '基估宝',
  tagline: '实时基金估值与重仓股追踪工具',
  favicon: 'img/favicon.svg',

  headTags: [
    {
      tagName: 'script',
      attributes: {
        type: 'text/javascript',
      },
      innerHTML: `
(function() {
  try {
    var params = new URLSearchParams(window.location.search);
    var theme = params.get('theme') || params.get('colorMode');
    if (theme === 'dark' || theme === 'light') {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch (e) {}
})();
`,
    },
  ],

  future: {
    v4: true,
  },

  url: 'https://fund.cc.cd',
  baseUrl: '/home/',

  organizationName: 'hzm0321',
  projectName: 'jgb-doc',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/demo/pc-demo-01.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: '基估宝',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '文档',
        },
        {
          type: 'docSidebar',
          sidebarId: 'cliSidebar',
          position: 'left',
          label: 'CLI 文档',
        },
        {
          href: 'https://fund.cc.cd/home/',
          label: '在线体验',
          position: 'left',
        },
        {
          href: 'https://github.com/hzm0321/jgb-doc',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '产品',
          items: [
            {
              label: '在线体验',
              href: 'https://fund.cc.cd/home/',
            },
            {
              label: '使用文档',
              to: '/docs/help',
            },
          ],
        },
        {
          title: '社区',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/hzm0321/jgb-doc',
            },
            {
              label: '问题反馈',
              href: 'https://github.com/hzm0321/jgb-doc/issues',
            },
          ],
        },
        {
          title: '技术栈',
          items: [
            {
              label: 'Next.js',
              href: 'https://nextjs.org/',
            },
            {
              label: 'Supabase',
              href: 'https://supabase.com/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} 基估宝. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
