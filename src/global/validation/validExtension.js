export function validExtension(extension) {
  if (!extension || typeof extension !== 'object') return false;
  const extensionAttributes = Object.keys(extension);
  const requiredAttributes = ['name', 'value'];
  return (
    requiredAttributes.filter((attribute) =>
      extensionAttributes.includes(attribute)
    ).length === requiredAttributes.length
  );
}
