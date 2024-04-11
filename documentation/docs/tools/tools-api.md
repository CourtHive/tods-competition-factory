---
title: API
---

Convenience methods useful for projects working with the Competition Factory.

---

## addExtension

Adds extension entry to element `.extensions` attribute; error checking; creates attribute if necessary; overwrites existing value;

```js
tools.addExtension({
  extension: { name, value },
  creationTime, // boolean - add timeStamp
  element: obj,
});
```

---

## calculateWinCriteria

---

## categoryCanContain

```js
const {
  invalidRatingRange,
  invalidAgeMinDate,
  invalidAgeMaxDate,
  invalidBallType,
  invalidAgeMax,
  invalidAgeMin,
  valid,
} = tools.categoryCanContain({
  childCategory: { ageCategoryCode: 'U16' },
  category: { ageCategoryCode: 'U18' },
});
```

---

## chunkArray

---

## countValues

---

## createMap

---

## generateDateRange

---

## dateTime

---

## definedAttributes

---

## dehydrateMatchUps

---

## extractAttributes

---

## findExtension

```js
const { extension } = tools.findExtension({ element, name });
```

---

## generateHashCode

---

## generateRange

---

## generateScoreString

---

## generateTimeCode

---

## getScaleValues

---

## getTimeItem

---

## hasAttributeValues

---

## instanceCount

---

## intersection

---

## isAdHoc

---

## isConvertableInteger

---

## isPowerOf2

---

## JSON2CSV

See [documentation page](/docs/tools/json-to-csv.mdx).

---

## makeDeepCopy

---

## matchUpSort

---

## nearestPowerOf2

---

## nextPowerOf2

---

## overlap

---

## parseScoreString

---

## randomMember

---

## randomPop

---

## roundRobinGroups

---

## checkScoreHasValue

---

## shuffleArray

---

## structureSort

---

## tidyScore

---

## tieFormatGenderValidityCheck

```js
const { valid, error } = tools.tieFormatGenderValidityCheck({
  referenceGender, // if not present then always returns { valid: true }
  matchUpType, // optional - check whether matchUpType is valid for referenceGender
  gender,
});
```

---

## unique

```js
engine.unique([]); // returns unique members of an array
```

---

## UUID

```js
engine.UUID(); // generates unique identifier
```

---

## UUIDS

```js
engine.UUIDS(count); // generates count unique identifiers
```

---

## validateTieFormat

---

## visualizeScheduledMatchUps

Generate color-coded printout of matchUp schedule details

```js
tools.visualizeScheduledMatchUps({
  showGlobalLogs: true,
  scheduledMatchUps,
});
```
