/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Competition Factory',
  tagline: 'Tournament Management Tools',
  url: 'https://github.com/CourtHive/tods-competition-factory',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'CourtHive', // Usually your GitHub org/user name.
  projectName: 'tods-competition-factory', // Usually your repo name.
  defaultDarkMode: false,
  themeConfig: {
    navbar: {
      title: 'Competition Factory',
      logo: {
        alt: 'CourtHive Logo',
        src: 'img/CourtHiveR.png',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/CourtHive/tods-competition-factory',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} CourtHive`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
