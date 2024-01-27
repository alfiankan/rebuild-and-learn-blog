import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Rebuild and Learn',
  tagline: 'Rebuild Popular Tech and Learn from it',
  favicon: 'img/docusaurus-social-card.jpg',

  // Set the production url of your site here
  url: 'https://rebuild-and-learn.pages.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'alfiankan', // Usually your GitHub org/user name.
  projectName: 'rebuild-and-learn-blog', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'id',
    locales: ['id'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../series',
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/alfiankan/rebuild-and-learn-blog',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/alfiankan/rebuild-and-learn-blog',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    algolia: {
      appId: 'X1Z85QJPUV',
      apiKey: 'bf7211c161e8205da2f933a02534105a',
      indexName: 'docusaurus-2',
      replaceSearchResultPathname: {
        from: '/docs/', 
        to: '/',
      },
    },
    colorMode: {
      defaultMode: 'dark',
    },
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Rebuild and Learn',
      logo: {
        alt: 'Rebuild and Learn Logo',
        src: 'img/hammer_and_wrench.png',
      },
      items: [
        {
          type: 'localeDropdown',
          position: 'right',
          dropdownItemsAfter: [
            {
              to: 'https://my-site.com/help-us-translate',
              label: 'Help us translate',
            },
          ],
        },
        {
          href: 'https://github.com/alfiankan/rebuild-and-learn-blog',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Series',
          items: [
            {
              label: 'Membuat Database Engine',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Github',
              href: 'https://github.com/alfiankan/rebuild-and-learn-blog',
            },
            {
              label: 'Medium',
              href: 'https://alfiankan.medium.com',
            },
          ],
        },
      ],
      copyright: `Copyleft © ${new Date().getFullYear()} by github.com/alfiankan Rebuild and Learn - go learn and have fun.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
