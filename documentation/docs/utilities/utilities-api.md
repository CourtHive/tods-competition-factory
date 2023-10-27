---
title: utilities API
---

Convenience methods useful for projects working with the Competition Factory.

---

## addExtension

Adds extension entry to element `.extensions` attribute; error checking; creates attribute if necessary; overwrites existing value;

```js
addExtension({
  extension: { name, value },
  creationTime, // boolean - add timeStamp
  element: obj,
});
```

---

## calculateWinCriteria

---

## chunkArray

---

## compareTieFormats

---

## countValues

---

## createMap

---

## dateRange

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
const { extension } = findExtension({ element, name });
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

## getCategoryAgeDetails

Parses `ageCategoryCode` to determine min/max eligible birthdates and min/max age. Category age/birthdate boundaries can be specified using other attributes.
If attributes are combined will sanity check correspondence and return an array of any encountered errors.

```js
const {
} = utilities.getCategoryAgeDetails({
  consideredDate, // returns either supplied value or date when invoked
  combinedAge, // boolean indicating that ageMax and ageMin are combined values
  ageMaxDate,
  ageMinDate,
  ageMax,
  ageMin,
  errors,
} = utilities.getCategoryAgeDetails({
  consideredDate, // optional - date string 'YYYY-MM-DD'; defaults to current date
  category: {
    ageCategoryCode, // TODS code, e.g. 'U18', '18U', '18O', 'O18', '8O-U18', 'C50-70'
    categoryName, // when no ageCategoryCode is provided, an attempt is made to find in categoryName
    ageMaxDate, // latest/most recent date acceptable for eligibilty
    ageMinDate, // earliest date acceptable for eligibility
    ageMax, // maximum age acceptable for eligibility
    ageMin, // minimum age acceptable for eligibility
  },
});
```

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

## scoreHasValue

---

## shuffleArray

---

## structureSort

---

## tidyScore

---

## unique

---

## UUID

---

## UUIDS

---

## validateTieFormat

---

## visualizeScheduledMatchUps

Generate color-coded printout of matchUp schedule details

```js
visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLogs: true });
```
