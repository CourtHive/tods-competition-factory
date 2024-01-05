module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Competition Factory',
      items: ['introduction', 'features', 'tmx', 'installation'],
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
        'concepts/publishing',
        'concepts/scheduling',
        'concepts/scaleItems',
        'concepts/timeItems',
        'concepts/subscriptions',
      ],
    },
    {
      type: 'category',
      label: 'State Engines',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'state-engines',
        },
        { type: 'doc', label: 'askEngine', id: 'state-engines' },
        { type: 'doc', label: 'syncEngine', id: 'state-engines' },
        { type: 'doc', label: 'asyncEngine', id: 'state-engines' },
      ],
    },
    {
      type: 'category',
      label: 'Governors',
      items: [
        {
          type: 'doc',
          label: 'Overview',
          id: 'engines/competition-engine-overview',
        },
      ],
    },
    {
      type: 'category',
      label: 'Data',
      items: [
        'constants',
        {
          Codes: [
            'codes/age-category',
            'codes/matchup-format',
            'enums/tournament-level',
          ],
        },
        'types/typedefs',
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
