export function attributeFilter(params) {
  if (params === null) return {};
  const { source, template } = params || {};
  if (!template) return source;

  const target = {};
  attributeCopy(source, template, target);

  return target;

  function attributeCopy(valuesObject, templateObject, outputObject) {
    if (!valuesObject || !templateObject) return;
    const vKeys = Object.keys(valuesObject);
    const oKeys = Object.keys(templateObject);

    // the orMap allows spcification of { 'a||b': boolean } so that filter templates can apply to multiple attributes
    const orMap = Object.assign(
      {},
      ...oKeys
        .filter((key) => key.indexOf('||'))
        .map((key) => key.split('||').map((or) => ({ [or]: key })))
        .flat()
    );
    const allKeys = oKeys.concat(...Object.keys(orMap));
    const wildcard = allKeys.includes('*');

    for (let k = 0; k < vKeys.length; k++) {
      if (allKeys.indexOf(vKeys[k]) >= 0 || wildcard) {
        const templateKey = orMap[vKeys[k]] || vKeys[k];
        const tobj = templateObject[templateKey] || wildcard;
        const vobj = valuesObject[vKeys[k]];

        if (
          typeof tobj === 'object' &&
          typeof vobj !== 'function' &&
          !Array.isArray(tobj)
        ) {
          if (Array.isArray(vobj)) {
            const mappedElements = vobj
              .map((arrayMember) => {
                const target = {};
                const result = attributeCopy(arrayMember, tobj, target);
                if (result !== false) return target;
              })
              .filter(Boolean);
            outputObject[vKeys[k]] = mappedElements;
          } else if (vobj) {
            outputObject[vKeys[k]] = {};
            attributeCopy(vobj, tobj, outputObject[vKeys[k]]);
          }
        } else {
          const value = valuesObject[vKeys[k]];
          const exclude = Array.isArray(tobj) && !tobj.includes(value);
          if (exclude) return false;

          if (
            templateObject[vKeys[k]] ||
            (wildcard && templateObject[vKeys[k]] !== false)
          ) {
            outputObject[vKeys[k]] = value;
          }
        }
      }
    }
  }
}
