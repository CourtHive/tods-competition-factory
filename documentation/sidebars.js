module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Competition Factory',
      items: ['introduction', 'features', 'installation'],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/actions',
        'concepts/accessors',
        'concepts/context',
        {
          'Data Structures': ['concepts/matchUpFormat', 'concepts/tieFormat'],
        },
        'concepts/draw-generation',
        'concepts/globalState',
        {
          Policies: [
            'concepts/policies',
            {
              Avoidance: ['policies/avoidance', 'policies/accessors'],
            },
            'policies/positionActions',
            'policies/positioningSeeds',
            'policies/scheduling',
            'policies/tallyPolicy',
            'policies/feedPolicy',
          ],
        },
        'concepts/scheduling',
        'concepts/scaleItems',
        'concepts/timeItems',
        'concepts/subscriptions',
      ],
    },
    {
      type: 'doc',
      label: 'Constants',
      id: 'constants',
    },
    {
      type: 'category',
      label: 'Mocks Engine',
      items: [
        'apis/mocks-engine-overview',
        'apis/mocks-engine-api',
        'engines/mocks-engine-examples',
      ],
    },
    {
      type: 'category',
      label: 'Competition Engine',
      items: [
        'apis/competition-engine-overview',
        'apis/competition-engine-api',
      ],
    },
    {
      type: 'category',
      label: 'Tournament Engine',
      items: ['apis/tournament-engine-overview', 'apis/tournament-engine-api'],
    },
    {
      type: 'category',
      label: 'Draw Engine',
      items: ['engines/draw-engine-overview', 'apis/draw-engine-api'],
    },
    {
      type: 'doc',
      label: 'scoreGovernor',
      id: 'scoreGovernor',
    },
    {
      type: 'category',
      label: 'Utilities',
      items: ['utilities/make-deep-copy', 'utilities/json-to-csv'],
    },
  ],
};
