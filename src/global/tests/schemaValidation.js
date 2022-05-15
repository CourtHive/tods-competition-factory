import Ajv from 'ajv';
import fs from 'fs';

import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

const schema = JSON.parse(
  fs.readFileSync('./src/global/schema/tournament.schema.json', 'UTF-8')
);
const data = JSON.parse(
  fs.readFileSync('./src/global/testHarness/avoidance.tods.json', 'UTF-8')
);

const validate = ajv.compile(schema);
validate(data);
validate.errors;
