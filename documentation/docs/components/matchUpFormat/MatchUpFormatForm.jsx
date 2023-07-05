import { matchUpFormatCode } from 'tods-competition-factory';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MuiMenuItem from '@material-ui/core/MenuItem';
import SetFormatSelector from './SetFormatSelector';
import { matchUpFormats } from './matchUpFormats';
import MuiSelect from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import { useStyles } from './style';
import React from 'react';

const MatchUpFormatForm = ({ disabled, matchUpFormatParsed, onChange }) => {
  const classes = useStyles();

  const defaultMatchUpFormats = matchUpFormats().formats;
  const timed =
    matchUpFormatParsed?.timed || matchUpFormatParsed?.setFormat?.timed;

  const updateMatchUpFormat = (matchUpFormat) => {
    onChange?.(matchUpFormat);
  };

  const setsUpdate = (matchUpFormat) => updateMatchUpFormat(matchUpFormat);
  const hasFinalSet =
    matchUpFormatParsed && !!matchUpFormatParsed.finalSetFormat;

  const scoringFormatChanged = (e) => {
    const key = e && e.target && e.target.value;
    const matchUpFormat = defaultMatchUpFormats.find(
      (defaultMatchUpFormat) => defaultMatchUpFormat.key === key
    )?.format;
    const matchUpFormatParsed = matchUpFormatCode.parse(matchUpFormat);
    updateMatchUpFormat(matchUpFormatParsed);
  };

  const activeMatchUpFormat = () => {
    return (
      defaultMatchUpFormats.reduce(
        (p, c) =>
          c.format === matchUpFormatCode.stringify(matchUpFormatParsed)
            ? c.key
            : p,
        undefined
      ) || 'custom'
    );
  };

  const renderCustomScoring = () => {
    return (
      <>
        <Grid
          container
          direction="row"
          justify="flex-start"
          className={classes.row}
        >
          <Grid item>
            <SetFormatSelector
              matchUpFormatParsed={matchUpFormatParsed}
              disabled={disabled}
              onChange={setsUpdate}
              hasFinalSet={hasFinalSet}
            />
            {!hasFinalSet || timed ? null : (
              <SetFormatSelector
                matchUpFormatParsed={matchUpFormatParsed}
                disabled={disabled}
                isFinalSet={true}
                onChange={setsUpdate}
                hasFinalSet={hasFinalSet}
              />
            )}
          </Grid>
        </Grid>
      </>
    );
  };

  function renderMatchUpFormat(f) {
    return (
      <MuiMenuItem key={f.key} value={f.key}>
        <ul className={classes.matchUpFormatList}>
          <li className={classes.matchUpFormat}>{f.name}</li>
          {f.desc ? (
            <li key={`${f.key}_1`} style={{ fontSize: 10 }}>
              {f.desc}
            </li>
          ) : (
            ''
          )}
          {f.desc2 ? (
            <li key={`${f.key}_2`} style={{ fontSize: 10 }}>
              {f.desc2}
            </li>
          ) : (
            ''
          )}
        </ul>
      </MuiMenuItem>
    );
  }

  const renderPreDefinedScoring = () => {
    return (
      <>
        <FormControl
          style={{ minWidth: 120, width: '100%', margin: 0, padding: 0 }}
        >
          <InputLabel>{'Scoring'}</InputLabel>
          <MuiSelect
            value={activeMatchUpFormat()}
            onChange={scoringFormatChanged}
          >
            {defaultMatchUpFormats.map(renderMatchUpFormat)}
          </MuiSelect>
        </FormControl>
      </>
    );
  };

  return (
    <>
      <Grid
        justify-content="flex-start"
        className={classes.row}
        direction="row"
        container
      >
        <Grid item className={classes.minimums}>
          {renderPreDefinedScoring()}
        </Grid>
      </Grid>
      {renderCustomScoring()}
    </>
  );
};

export default MatchUpFormatForm;
