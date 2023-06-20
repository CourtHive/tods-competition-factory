import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import React, { useState } from 'react';

import { getTiebreakOptions, hasTiebreakObjectBuilder } from './utils';

const SetFormatSelector = ({
  matchUpFormatParsed,
  hasFinalSet,
  isFinalSet,
  disabled,
  onChange,
}) => {
  const setFormat = isFinalSet
    ? matchUpFormatParsed?.finalSetFormat
    : matchUpFormatParsed?.setFormat;
  const setsAreTiebreakSets = setFormat?.tiebreakSet;
  const setTiebreakTo =
    setFormat?.tiebreakFormat?.tiebreakTo || setFormat?.tiebreakSet?.tiebreakTo;
  const tiebreakExistsRegular =
    matchUpFormatParsed?.setFormat &&
    matchUpFormatParsed?.setFormat?.noTiebreak;
  const tiebreakExistsFinal =
    matchUpFormatParsed?.finalSetFormat &&
    matchUpFormatParsed?.finalSetFormat?.noTiebreak;

  const timed = matchUpFormatParsed?.timed || setFormat?.timed;

  const initialState = {
    exact: matchUpFormatParsed?.bestOf === 1 ? 'exact' : 'bestof',
    what:
      (setsAreTiebreakSets && 'TB') ||
      (setFormat?.setTo && 'S') ||
      (timed && 'T') ||
      'S',
  };

  const [commonState, setCommonState] = useState(initialState);

  const counts =
    (['S', 'TB'].indexOf(commonState.what) >= 0 &&
      [1, 3, 5].map((key) => ({ key, name: key }))) ||
    [1, 3, 5].map((key) => ({ key, name: key }));
  const whatTo =
    commonState.what === 'T'
      ? [10, 15, 20, 25, 30, 45, 60, 90].map((key) => ({
          name: `${key} Minutes`,
          key,
        }))
      : commonState.what === 'TB'
      ? [5, 7, 9, 10, 11, 12, 15, 21].map((key) => ({
          name: `to ${key}`,
          key,
        }))
      : [1, 2, 3, 4, 5, 6, 7, 8, 9].map((key) => ({
          name: `to ${key}`,
          key,
        }));

  const finalFixed = 'final';
  const finals = [{ key: 'final', name: 'Final Set' }];

  const exactly =
    matchUpFormatParsed?.bestOf === 1
      ? [{ key: 'exact', name: 'Exactly' }]
      : [
          { key: 'bestof', name: 'Best Of' },
          { key: 'exact', name: 'Exactly' },
        ];
  const isDisabled = (what) => (disabled || []).indexOf(what) >= 0;
  const bestOfSingular = [
    { key: 'S', name: 'Set' },
    { key: 'TB', name: 'Tiebreak' },
    {
      disabled: isDisabled('timed') || isFinalSet,
      name: 'Timed Set',
      key: 'T',
    },
  ];
  const bestOfPlural = [
    { key: 'S', name: 'Sets' },
    { key: 'TB', name: 'Tiebreaks' },
    {
      key: 'T',
      name: 'Timed Sets',
      disabled: isDisabled('timed') || isFinalSet,
    },
  ];
  const bestOfWhat =
    !matchUpFormatParsed?.bestOf ||
    matchUpFormatParsed?.bestOf === 1 ||
    isFinalSet
      ? bestOfSingular
      : bestOfPlural;

  const adnoad = [
    { key: false, name: 'Ad' },
    { key: true, name: 'No Ad' },
  ];
  const winbywhat = [1, 2].map((key) => ({
    key,
    name: `Win by ${key}`,
  }));

  // bestOf value
  const bestOfValue = matchUpFormatParsed?.bestOf || counts[0].key;

  // populates the tiebreak to selector
  const tiebreakTo = [5, 7, 9, 10, 12].map((key) => ({
    name: `TB to: ${key}`,
    key,
  }));

  // populates the tiebreak at selector
  const tiebreakAt = getTiebreakOptions(setFormat?.setTo).map((key) => ({
    name: `@ ${key}`,
    key,
  }));

  // ad / no ad in regular set value
  const NoAD = setFormat?.NoAD;

  // ad / no ad in tiebreak value
  const NoADTiebreak =
    !!setFormat?.tiebreakFormat?.NoAD || !!setFormat?.tiebreakSet?.NoAD;

  // determines if set is noTiebreak
  const hasTiebreak = (event) => {
    const set = isFinalSet
      ? {
          finalSetFormat: hasTiebreakObjectBuilder(
            event,
            setFormat,
            setTiebreakTo
          ),
        }
      : {
          setFormat: hasTiebreakObjectBuilder(event, setFormat, setTiebreakTo),
        };

    const updatedFormat = { ...matchUpFormatParsed, ...set };
    onChange(updatedFormat);
  };
  const handleChangeExact = (event) => {
    setCommonState({ ...commonState, exact: event.target.value });
  };
  const handleChangeBestOf = (event) => {
    onChange({ ...matchUpFormatParsed, bestOf: event.target.value || 1 });
  };
  const handleChangeDefaultAd = (event) => {
    onChange({
      ...matchUpFormatParsed,
      [isFinalSet ? 'finalSetFormat' : 'setFormat']: {
        ...setFormat,
        NoAD: event.target.value,
      },
    });
  };
  const handleChangeTiebreakTo = (event) => {
    onChange({
      ...matchUpFormatParsed,
      [isFinalSet ? 'finalSetFormat' : 'setFormat']: {
        ...setFormat,
        [setFormat?.tiebreakFormat ? 'tiebreakFormat' : 'tiebreakSet']: {
          ...(setFormat?.tiebreakFormat
            ? setFormat?.tiebreakFormat
            : setFormat?.tiebreakSet),
          tiebreakTo: event.target.value,
        },
      },
    });
  };
  const handleChangeTiebreakAt = (event) => {
    onChange({
      ...matchUpFormatParsed,
      [isFinalSet ? 'finalSetFormat' : 'setFormat']: {
        ...setFormat,
        tiebreakAt: event.target.value,
      },
    });
  };
  const handleChangeTiebreakAd = (event) => {
    const adNoAd = event.target.value === 1 ? true : false;
    onChange({
      ...matchUpFormatParsed,
      [isFinalSet ? 'finalSetFormat' : 'setFormat']: {
        ...setFormat,
        [setFormat?.tiebreakFormat ? 'tiebreakFormat' : 'tiebreakSet']: {
          ...(setFormat?.tiebreakFormat
            ? setFormat?.tiebreakFormat
            : setFormat?.tiebreakSet),
          NoAD: adNoAd,
        },
      },
    });
  };
  const handleChangeWhatTo = (event) => {
    const eventValue = event.target.value;
    const tiebreakAt = getTiebreakOptions(eventValue).reverse()[0];
    if (timed) {
      onChange({
        ...matchUpFormatParsed,
        setFormat: { timed: true, minutes: eventValue },
      });
    } else if (isFinalSet) {
      const existingSetFormat = matchUpFormatParsed?.finalSetFormat || {};
      const isTiebreakSet = matchUpFormatParsed?.finalSetFormat?.tiebreakSet;
      const finalSetFormat = isTiebreakSet
        ? { tiebreakSet: { tiebreakTo: eventValue } }
        : { ...existingSetFormat, setTo: eventValue, tiebreakAt };
      onChange({
        ...matchUpFormatParsed,
        finalSetFormat: finalSetFormat,
      });
    } else {
      const existingSetFormat = matchUpFormatParsed?.setFormat || {};
      const isTiebreakSet = matchUpFormatParsed?.setFormat?.tiebreakSet;
      const setFormat = isTiebreakSet
        ? { tiebreakSet: { tiebreakTo: eventValue } }
        : { ...existingSetFormat, setTo: eventValue, tiebreakAt };
      onChange({
        ...matchUpFormatParsed,
        setFormat,
      });
    }
  };
  const handleChangeBestOfWhat = (event) => {
    const value = event.target.value;
    setCommonState({ ...commonState, what: value });

    if (value === 'T') {
      onChange({
        setFormat: { timed: true, minutes: 10 },
        bestOf: 1,
      });
    } else if (value === 'TB') {
      const newSetFormat = !isFinalSet
        ? { tiebreakSet: { tiebreakTo: setTiebreakTo || 7 } }
        : { ...setFormat };
      const newFinalSetFormat = isFinalSet && {
        tiebreakSet: { tiebreakTo: setTiebreakTo || 7 },
      };
      onChange({
        bestOf: bestOfValue,
        setFormat: newSetFormat,
        finalSetFormat: newFinalSetFormat,
      });
    } else if (value === 'S') {
      const newSetFormat = !isFinalSet
        ? { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } }
        : { ...setFormat };
      const newFinalSetFormat = isFinalSet && {
        setTo: 6,
        tiebreakAt: 6,
        tiebreakFormat: { tiebreakTo: 7 },
      };
      onChange({
        bestOf: bestOfValue,
        setFormat: newSetFormat,
        finalSetFormat: newFinalSetFormat,
      });
    }
  };

  const changeFinalSet = (event) => {
    onChange({
      ...matchUpFormatParsed,
      finalSetFormat: event.target.checked ? { ...setFormat } : undefined,
    });
  };

  // methods used to determine which value should be selected on render
  // used for values from common state and to determine what type of set is it
  const activeWhatTo = () => {
    if (timed) {
      return whatTo.reduce((p, c) =>
        c.key === matchUpFormatParsed?.minutes ||
        c.key === matchUpFormatParsed?.setFormat?.minutes
          ? c
          : p
      ).key;
    } else if (commonState.what === 'TB') {
      return whatTo.reduce((p, c) => (c.key === setTiebreakTo ? c : p)).key;
    } else {
      return whatTo.reduce((p, c) => (c.key === setFormat?.setTo ? c : p)).key;
    }
  };
  const activeBestOfWhat = () => {
    const activeBestOfWhatObject = bestOfWhat.reduce((p, c) =>
      c.key === commonState.what ? c : p
    );
    return activeBestOfWhatObject.key;
  };
  const activeExact = () => {
    const activeExactObject = exactly.reduce((p, c) =>
      c.key === commonState.exact ? c : p
    );
    return activeExactObject.key;
  };

  const finalSelector = () => {
    return (
      <Select id="ut-final-selector" value={finalFixed}>
        {finals.map((item) => renderItem(item))}
      </Select>
    );
  };

  const exactSelector = () => {
    if (!isFinalSet) {
      return (
        <Select
          id="ut-exact-selector"
          value={activeExact()}
          onChange={handleChangeExact}
        >
          {exactly.map((item) => renderItem(item))}
        </Select>
      );
    }
  };

  // value is either from parsed configuration or first value from counts array (defined by Charles)
  const bestOfSelector = () => {
    if (!isFinalSet) {
      return (
        <Select
          id="ut-best-of-selector"
          value={bestOfValue}
          onChange={handleChangeBestOf}
        >
          {counts.map((item) => renderItem(item))}
        </Select>
      );
    }
  };
  const bestOfWhatSelector = () => {
    return (
      <Select value={activeBestOfWhat()} onChange={handleChangeBestOfWhat}>
        {bestOfWhat.map((item) => renderItem(item))}
      </Select>
    );
  };
  const whatToSelector = () => {
    return (
      <Select value={activeWhatTo()} onChange={handleChangeWhatTo}>
        {whatTo.map((item) => renderItem(item))}
      </Select>
    );
  };
  const defaultAdSelector = () => {
    if (commonState.what === 'S') {
      return (
        <Select value={!!NoAD} onChange={handleChangeDefaultAd}>
          {adnoad.map((item) => renderItem(item))}
        </Select>
      );
    }
  };
  const tiebreakToSelector = () => {
    if (
      commonState.what === 'S' &&
      (isFinalSet ? !tiebreakExistsFinal : !tiebreakExistsRegular)
    ) {
      return (
        <Select value={setTiebreakTo} onChange={handleChangeTiebreakTo}>
          {tiebreakTo.map((item) => renderItem(item))}
        </Select>
      );
    }
  };
  const tiebreakAtSelector = () => {
    if (
      commonState.what === 'S' &&
      (isFinalSet ? !tiebreakExistsFinal : !tiebreakExistsRegular) &&
      setFormat?.setTo > 1
    ) {
      return (
        <Select value={setFormat?.tiebreakAt} onChange={handleChangeTiebreakAt}>
          {tiebreakAt.map((item) => renderItem(item))}
        </Select>
      );
    }
  };
  const tiebreakAdSelector = () => {
    if (
      commonState.what !== 'T' &&
      (isFinalSet ? !tiebreakExistsFinal : !tiebreakExistsRegular)
    ) {
      return (
        <Select value={NoADTiebreak ? 1 : 2} onChange={handleChangeTiebreakAd}>
          {winbywhat.map((item) => renderItem(item))}
        </Select>
      );
    }
  };

  const renderItem = (item) => {
    return (
      <MenuItem
        data-test-id={item.key}
        key={item.key}
        disabled={item.disabled}
        value={item.key}
      >
        {item.name}
      </MenuItem>
    );
  };

  return (
    <>
      <Grid container spacing={1} direction="row" justify="flex-start">
        {isFinalSet ? <Grid item> {finalSelector()} </Grid> : null}
        {isFinalSet ? null : <Grid item> {exactSelector()} </Grid>}
        {isFinalSet ? null : <Grid item> {bestOfSelector()} </Grid>}
        <Grid item> {defaultAdSelector()} </Grid>
        <Grid item> {bestOfWhatSelector()} </Grid>
        <Grid item> {whatToSelector()} </Grid>
        <Grid item> {tiebreakToSelector()} </Grid>
        <Grid item> {tiebreakAtSelector()} </Grid>
        <Grid item> {tiebreakAdSelector()} </Grid>
      </Grid>
      <Grid container direction="row" justify="flex-start">
        <Grid item>
          {commonState.what !== 'S' ? (
            ''
          ) : (
            <FormControlLabel
              control={
                <Switch
                  checked={
                    isFinalSet ? !tiebreakExistsFinal : !tiebreakExistsRegular
                  }
                  onChange={hasTiebreak}
                  name="scoring-format-tiebreak"
                />
              }
              label={'Tiebreak'}
            />
          )}
        </Grid>

        <Grid item>
          {commonState.what === 'T' ||
          isFinalSet ||
          matchUpFormatParsed?.bestOf < 2 ? (
            ''
          ) : (
            <FormControlLabel
              control={
                <Switch
                  checked={hasFinalSet}
                  onChange={changeFinalSet}
                  name="scoring-format-tiebreak"
                />
              }
              label={'Final Set'}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default SetFormatSelector;
