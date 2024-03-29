/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Competition Factory',
  tagline: 'Tournament Management Tools',
  url: 'https://courthive.github.com',
  baseUrl: '/tods-competition-factory/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'CourtHive',
  projectName: 'tods-competition-factory',
  themes: ['@docusaurus/theme-live-codeblock'],
  themeConfig: {
    navbar: {
      title: 'Competition Factory',
      logo: {
        alt: 'CourtHive Logo',
        src: 'img/CourtHive.png',
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
    mermaid: {
      theme: { light: 'neutral', dark: 'forest' },
      // mermaidOptions: { maxTextSize: 50 },
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
  plugins: [
    [
      // require.resolve('docusaurus-plugin-search-local'), // typescript fork
      require.resolve('@cmfcmf/docusaurus-search-local'),
      {
        // docusaurus-plugin-search-local (typscript fork)
        // highlightSearchTermsOnTargetPage: false,
        // docsRouteBasePath: '/docs',
        // docsDir: 'docs',
        // hashed: false,

        // @cmfcmf/docusaurus-search-local (original project)
        maxSearchResults: 8,
        indexBlog: false,
        style: undefined,
      },
    ],
  ],
};
