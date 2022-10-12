---
title: structureSort
---

Sorting function to arrange structures by stage, positionAssignments count (size) then stageSequence
Used internally to order Compass structures

```js
import { utilities } from 'tods-competition-factory';
const sortedStructures = drawDefinition.structures.sort(
  utilities.structureSort
);
```

## Optionally pass configuration object.

Mode 'finishing positions' sorts MAIN stage structures by participant final positions first, followwed by PLAY_OFF, CONSOLATION, QUALIFYING and finally VOLUNTARY_CONSOLATION. NOTE: Compass directions are all considered MAIN stage.

```js
import { drawDefinitionConstants, utilities } from 'tods-competition-factory';
const { FINISHING_POSITIONS } = drawDefinitionConstants;

const sortedStructures = drawDefinition.structures.sort((a, b) =>
  utilities.structureSort(a, b, { mode: FINISHING_POSITIONS })
);
```

Mode 'aggregate event structures' sorts MAIN stageSequence: 1 first, then PLAY_OFF structures, remaining MAIN stageSequences, followed by CONSOLATION, QUALIFYING and finally VOLUNTARY_CONSOLATION.

```js
import { drawDefinitionConstants, utilities } from 'tods-competition-factory';
const { AGGREGATE_EVENT_STRUCTURES } = drawDefinitionConstants;

const sortedStructures = drawDefinition.structures.sort((a, b) =>
  utilities.structureSort(a, b, { mode: AGGREGATE_EVENT_STRUCTURES })
);
```

---
