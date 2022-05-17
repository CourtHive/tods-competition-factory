import Ajv from 'ajv';
import fs from 'fs';

import addFormats from 'ajv-formats';

const ajv = new Ajv({ allowUnionTypes: true, verbose: true, allErrors: true });
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
    const result = validate(data);

    // to document pattern of use
    if (validate.errors) {
      const errors = ajv.errorsText(validate.errors, {
        dataVar: 'config',
      });
      console.log({ errors });
    }

    expect(result).toEqual(true);
  }
);
