import Ajv from 'ajv';
import fs from 'fs';

import addFormats from 'ajv-formats';

const ajv = new Ajv({ allowUnionTypes: true, verbose: true });
addFormats(ajv);

const schema = JSON.parse(
  fs.readFileSync('./src/global/schema/tournament.schema.json', 'UTF-8')
);
const validate = ajv.compile(schema);

const sourcePath = './src/global/testHarness';
const filenames = fs
  .readdirSync(sourcePath)
  .filter((filename) => filename.indexOf('.tods.json') > 0);

it.each(filenames)(
  'can validate all tods files in testHarness directory',
  (filename) => {
    const data = JSON.parse(
      fs.readFileSync(`./src/global/testHarness/${filename}`, 'UTF-8')
    );
    expect(validate(data)).toEqual(true);
  }
);
