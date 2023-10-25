module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Competition Factory',
      items: [
        'introduction',
        'state-engines',
        'features',
        'tmx',
        'installation',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/actions',
        'concepts/accessors',
        'concepts/context',
        'concepts/draw-generation',
        'concepts/globalState',
        {
          Policies: [
            'concepts/policies',
            {
              Avoidance: ['policies/avoidance', 'policies/accessors'],
            },
            'policies/positionActions',
            'policies/matchUpActions',
            'policies/participantPolicy',
            'policies/positioningSeeds',
            'policies/scheduling',
            'policies/rankingPolicy',
            'policies/roundNaming',
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
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'engines/mocks-engine-overview',
        },
        'engines/mocks-engine-examples',
        { type: 'doc', label: 'API', id: 'apis/mocks-engine-api' },
      ],
    },
    {
      type: 'category',
      label: 'Competition Engine',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'engines/competition-engine-overview',
        },
        { type: 'doc', label: 'API', id: 'apis/competition-engine-api' },
      ],
    },
    {
      type: 'category',
      label: 'Tournament Engine',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'engines/tournament-engine-overview',
        },
        { type: 'doc', label: 'API', id: 'apis/tournament-engine-api' },
      ],
    },
    {
      type: 'category',
      label: 'Draw Engine',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'engines/draw-engine-overview',
        },
        { type: 'doc', label: 'API', id: 'apis/draw-engine-api' },
      ],
    },
    {
      type: 'category',
      label: 'MatchUp Engine',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'engines/matchup-engine-overview',
        },
        { type: 'doc', label: 'API', id: 'apis/matchup-engine-api' },
      ],
    },
    {
      type: 'category',
      label: 'Scale Engine',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'engines/scale-engine-overview',
        },
        { type: 'doc', label: 'API', id: 'apis/scale-engine-api' },
      ],
    },
    {
      type: 'doc',
      label: 'Score Governor',
      id: 'scoreGovernor',
    },
    {
      type: 'category',
      label: 'Data',
      items: [
        'constants',
        'types/typedefs',
        {
          'Codes and Enums': [
            'codes/age-category',
            'codes/matchup-format',
            'enums/tournament-level',
          ],
        },
        'concepts/extensions',
        {
          Explanation: [
            'concepts/lineUp',
            'concepts/tieFormat',
            'concepts/tieMatchUp',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Utilities',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'utilities/utilities-overview',
        },
        'utilities/make-deep-copy',
        'utilities/structure-sort',
        'utilities/json-to-csv',
        { type: 'doc', label: 'API', id: 'utilities/utilities-api' },
      ],
    },
  ],
};
