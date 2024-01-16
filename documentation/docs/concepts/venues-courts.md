---
title: Venues and Courts
---

import RenderJSON from '../components/RenderJSON';
import dateAvailability from './assets/dateAvailability.json';

### dateAvailability

A `dateAvailability` definition is an array of objects which define a `startTime` and `endTime` for court availability.

:::note
When no date is specified in a `dateAvailability` object the `startTime` and `endTime` apply to all valid tournament dates; defining a `date` attribute scopes the
definition to a specific date.
:::

`dateAvailability` definitions can also contain an array of `bookings` objects which makes courts unavailable to auto-scheduling
functions during specified blocks of time.

<RenderJSON
data={dateAvailability}
root={'dateAvailability'}
colorScheme={'summerfruit'}
invertTheme={true}
expandRoot={true}
expandToLevel={2}
/>
