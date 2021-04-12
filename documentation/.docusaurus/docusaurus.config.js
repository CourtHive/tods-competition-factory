export default {
  "title": "Competition Factory",
  "tagline": "Tournament Management Tools",
  "url": "https://github.com/CourtHive",
  "baseUrl": "/tods-competition-factory/",
  "onBrokenLinks": "throw",
  "onBrokenMarkdownLinks": "warn",
  "favicon": "img/favicon.ico",
  "organizationName": "CourtHive",
  "projectName": "tods-competition-factory",
  "themeConfig": {
    "navbar": {
      "title": "Competition Factory",
      "logo": {
        "alt": "CourtHive Logo",
        "src": "img/CourtHive.png"
      },
      "items": [
        {
          "to": "docs/",
          "activeBasePath": "docs",
          "label": "Docs",
          "position": "left"
        },
        {
          "href": "https://github.com/CourtHive/tods-competition-factory",
          "label": "GitHub",
          "position": "right"
        }
      ],
      "hideOnScroll": false
    },
    "footer": {
      "style": "dark",
      "links": [],
      "copyright": "Copyright © 2021 CourtHive"
    },
    "colorMode": {
      "defaultMode": "light",
      "disableSwitch": false,
      "respectPrefersColorScheme": false,
      "switchConfig": {
        "darkIcon": "🌜",
        "darkIconStyle": {},
        "lightIcon": "🌞",
        "lightIconStyle": {}
      }
    },
    "docs": {
      "versionPersistence": "localStorage"
    },
    "metadatas": [],
    "prism": {
      "additionalLanguages": []
    },
    "hideableSidebar": false
  },
  "presets": [
    [
      "@docusaurus/preset-classic",
      {
        "docs": {
          "sidebarPath": "/Users/charlesallen/Development/CourtHive/tods-competition-factory/documentation/sidebars.js"
        },
        "theme": {
          "customCss": "/Users/charlesallen/Development/CourtHive/tods-competition-factory/documentation/src/css/custom.css"
        }
      }
    ]
  ],
  "baseUrlIssueBanner": true,
  "i18n": {
    "defaultLocale": "en",
    "locales": [
      "en"
    ],
    "localeConfigs": {}
  },
  "onDuplicateRoutes": "warn",
  "customFields": {},
  "plugins": [],
  "themes": [],
  "titleDelimiter": "|",
  "noIndex": false
};