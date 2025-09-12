// docusaurus.config.js
// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'grblHAL Documentation',
  tagline: 'The official documentation for the grblHAL project.',
  favicon: 'img/favicon.ico', // You can create a favicon later

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.com', // <<<<<<< REQUIRED: CHANGE THIS LATER
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/grblhal_docs', // <<<<<<< REQUIRED

  // GitHub pages deployment config.
  organizationName: 'petervanderwalt', // Your GitHub username.
  projectName: 'grblhal_docs', // Your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/', // Serve docs from the site root
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/PETERVANDERWALT/grblhal_docs/tree/main/',
        },
        blog: false, // We disabled the blog plugin
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'grblHAL',
        logo: {
          alt: 'grblHAL Logo',
          src: 'img/logo.svg', // You can create a logo later
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/grblHAL/grblHAL',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          // You can add footer links here
        ],
        copyright: `Copyright © ${new Date().getFullYear()} grblHAL Project. Built with Docusaurus.`,
      },
    }),
};

export default config;
