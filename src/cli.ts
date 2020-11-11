import inquirer from 'inquirer'
import { converter } from './index'
import { customInspect } from './utils/log'

inquirer
  .prompt([
    {
      name: 'protoPath',
      type: 'input',
    },
    {
      name: 'serviceName',
      type: 'input',
    },
  ])
  .then(async ({ protoPath, serviceName }) => {
    await converter(protoPath, serviceName)
  })
  .catch((error) => {
    if (error.isTtyError) {
      customInspect("Prompt couldn't be rendered in the current environment")
    } else {
      customInspect(error)
    }
  })
