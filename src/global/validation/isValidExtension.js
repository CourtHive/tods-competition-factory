export function isValidExtension({
  requiredAttributes = ['name', 'value'],
  extension,
}) {
  if (!extension || typeof extension !== 'object') return false;
  if (typeof extension.name !== 'string') return false;
  const extensionAttributes = Object.keys(extension);
  return (
    requiredAttributes.filter((attribute) =>
      extensionAttributes.includes(attribute)
    ).length === requiredAttributes.length
  );
}
