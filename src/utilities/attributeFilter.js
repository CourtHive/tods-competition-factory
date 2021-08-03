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
        const tobj = templateObject[vKeys[k]];
        const vobj = valuesObject[vKeys[k]];
        if (tobj && typeof tobj === 'object' && typeof vobj !== 'function') {
          if (Array.isArray(vobj)) {
            outputObject[vKeys[k]] = vobj.map((arrayMember) => {
              const target = {};
              attributeCopy(arrayMember, tobj, target);
              return target;
            });
          } else if (vobj) {
            outputObject[vKeys[k]] = {};
            attributeCopy(vobj, tobj, outputObject[vKeys[k]]);
          }
        } else {
          if (templateObject[vKeys[k]]) {
            outputObject[vKeys[k]] = valuesObject[vKeys[k]];
          }
        }
      }
    }
  }
}
