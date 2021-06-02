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
        'concepts/context',
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
        'concepts/timeItems',
        'concepts/scaleItems',
        'concepts/matchUpFormat',
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
