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
        'concepts/globalState',
        'concepts/matchUpFormat',
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
      type: 'category',
      label: 'Mocks Engine',
      items: ['engines/mocks-engine-examples', 'apis/mocks-engine-api'],
    },
    {
      type: 'category',
      label: 'Competition Engine',
      items: ['pseudocode/scheduling', 'apis/competition-engine-api'],
    },
    {
      type: 'category',
      label: 'Tournament Engine',
      items: ['apis/tournament-engine-api'],
    },
    {
      type: 'category',
      label: 'Draw Engine',
      items: [
        'engines/draw-engine-introduction',
        'engines/draw-types',
        'apis/draw-engine-api',
      ],
    },
  ],
};
