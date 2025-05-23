const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const fileTemplates = {
  route: mName => `import { Router } from 'express';
import { ${mName}Controllers } from './${mName}.controller';
import { ${mName}Validations } from './${mName}.validation';
import purifyRequest from '../../middlewares/purifyRequest';

const router = Router();

export const ${mName}Routes = router;`,

  interface: mName => `import { Types } from 'mongoose';

export type T${mName} = {
  _id?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
};`,

  model: mName => `import { Schema, model } from 'mongoose';
import { T${mName} } from './${mName}.interface';

const ${mName.toLowerCase()}Schema = new Schema<T${mName}>(
  {},
  { timestamps: true, versionKey: false },
);

const ${mName} = model<T${mName}>('${mName}', ${mName.toLowerCase()}Schema);

export default ${mName};`,

  controller: mName => `import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../util/server/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { ${mName}Services } from './${mName}.service';

export const ${mName}Controllers = {
  // {{key}}: catchAsync(async (req, res) => {
  //   const data = await ${mName}Services.{{key}}();
  //
  //   serveResponse(res, {
  //     // statusCode: StatusCodes.OK,
  //     message: '${mName} [value] successfully!',
  //     data,
  //   });
  // }),
};`,

  service: mName => `import { T${mName} } from './${mName}.interface';
import ${mName} from './${mName}.model';

export const ${mName}Services = {};`,

  validation: mName => `import { z } from 'zod';

export const ${mName}Validations = {};`,

  utils: () => '',

  lib: () => '',

  template: mName => `export const ${mName}Templates = {};`,

  middleware: mName => `export const ${mName}Middlewares = {};`,
};

inquirer
  .prompt([
    {
      type: 'input',
      name: 'moduleName',
      message: 'What is the module name?',
    },
    {
      type: 'checkbox',
      name: 'filesToCreate',
      message: 'Select files to create (default is all selected):',
      choices: [
        { name: 'Route', value: 'route', checked: true },
        { name: 'Interface', value: 'interface', checked: true },
        { name: 'Model', value: 'model', checked: true },
        { name: 'Controller', value: 'controller', checked: true },
        { name: 'Service', value: 'service', checked: true },
        { name: 'Validation', value: 'validation', checked: true },
        { name: 'Utils', value: 'utils', checked: false },
        { name: 'Lib', value: 'lib', checked: false },
        { name: 'Template', value: 'template', checked: false },
        { name: 'Middleware', value: 'middleware', checked: false },
      ],
    },
  ])
  .then(answers => {
    if (!answers?.moduleName?.trim()) {
      console.log('❌ Module name is required');
      process.exit(0);
    }

    const { moduleName, filesToCreate } = answers;
    const capitalizedMName =
      moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    const folderPath = path.resolve(__dirname, moduleName);

    try {
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

      filesToCreate.forEach(fileType => {
        const filePath = path.join(
          folderPath,
          `${capitalizedMName}.${fileType}.ts`,
        );

        const fileContent = fileTemplates[fileType](capitalizedMName) + '\n';

        fs.writeFileSync(filePath, fileContent);
        console.log(`Created file: ${filePath}`);
      });
    } catch (error) {
      console.error('Error creating files:', error);
    }
  });
