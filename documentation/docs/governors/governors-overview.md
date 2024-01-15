---
title: Governors
---

**Competition Factory** functions are organized into _governors_ which are responsible for specific areas of concern.

- **competitionGovernor**: functions which can operate across multiple tournaments
- **eventGoverrnor**: functions which mutate events, drawDefinitions, structures and matchUps
- **generationGovernor**: functions which generate e.g. drawDefinitions, playoff structures, mock tournamentRecords
- **matchUpFormatGoverrnor**: parse and stringify methods for matchUpFormats
- **mocksGovernor**: functions to generate data for testing
- **participantGovernor**: functions to add, modify, delete tournament participants
- **policyGovernor**: functions to attach and remove policies
- **publishingGovernor**: functions to manage publish state of tournaments, events, draws, structures, seeding
- **queryGovernor**: functions to query all aspects of tournament records
- **reportGovernor**: reporting functions
- **scheduleGovernor**: functions related to scheduling
- **scoreGovernor**: functions to validate, manipulate, analyze matchUp scores
- **tournamentGovernor**: functions which operate on tournament properties
- **utilitiesGovernor**: utility functions
- **venueGovernor**: functions to add and modify venues and courts

## Importing Governors

```js
import { governors } from 'tods-competition-factory';
```

:::info
See [Custom Engines](/docs/engines/custom-engines) for an example of importing governors into engines.
:::
