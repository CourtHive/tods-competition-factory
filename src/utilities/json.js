export function JSON2CSV(arrayOfJSON) {
  const replacer = (_, value) => (value === null ? '' : value);
  const header = Object.keys(arrayOfJSON[0]);
  return [
    header.join(','),
    ...arrayOfJSON.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(',')
    ),
  ].join('\r\n');
}
