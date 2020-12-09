export function attributeFilter({ source, template }) {
  const target = {};
  attributeCopy(source, template, target);
  return target;

  function attributeCopy(valuesObject, templateObject, outputObject) {
    if (!valuesObject || !templateObject) return;
    const vKeys = Object.keys(valuesObject);
    const oKeys = Object.keys(templateObject);
    for (let k = 0; k < vKeys.length; k++) {
      if (oKeys.indexOf(vKeys[k]) >= 0) {
        const oo = templateObject[vKeys[k]];
        const vo = valuesObject[vKeys[k]];
        if (
          oo &&
          typeof oo === 'object' &&
          typeof vo !== 'function' &&
          oo.constructor !== Array
        ) {
          outputObject[vKeys[k]] = {};
          attributeCopy(
            valuesObject[vKeys[k]],
            templateObject[vKeys[k]],
            outputObject[vKeys[k]]
          );
        } else {
          if (templateObject[vKeys[k]]) {
            outputObject[vKeys[k]] = valuesObject[vKeys[k]];
          }
        }
      }
    }
  }
}
