#!/usr/bin/env node
import chalk from 'chalk';
import clear from 'clear';
import program from 'commander';
import figlet from 'figlet';
import inquirer from 'inquirer';
import { Address4 } from 'ip-address';
import { isIPv4 } from 'net';
import { createConditionalForwardProxy } from './lib/proxy';

clear();
// tslint:disable-next-line: no-console
console.log(
  chalk.red(figlet.textSync('cfproxy', { horizontalLayout: 'full' }))
);

program
  .version('1.0.1')
  .description('A minimal HTTP / HTTPS forwarding proxy')
  .option('-p, --port', 'Port. Default: 5050')
  .option('-ri, --remoteProxyIp', 'Remote Proxy IP')
  .option('-rp, --remoteProxyPort', 'Remote Proxy Port')
  .option('-l, --logLevel', 'Loglevel')
  .parse(process.argv);

if (!program.port || !program.remoteProxyIp || !program.remoteProxyPort) {
  inquirer
    .prompt([
      {
        default: 5050,
        message: 'Local Port',
        name: 'port',
        type: 'number',
        when: () => !program.port
      },
      {
        message: 'Remote Proxy IP',
        name: 'remoteProxyIp',
        type: 'input',
        validate: input => {
          if (input) {
            return isIPv4(input);
          } else {
            return false;
          }
        },
        when: () => !program.targetProxy
      },
      {
        message: 'Remote Proxy Port',
        name: 'remoteProxyPort',
        type: 'number',
        when: () => !program.targetProxy
      }
    ])
    .then(answers => {
      createConditionalForwardProxy(answers.port, {
        host: new Address4(answers.remoteProxyIp),
        port: answers.remoteProxyPort
      });
    })
    .catch(error => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else when wrong
      }
    });
} else {
  createConditionalForwardProxy(program.port, {
    host: new Address4(program.remoteProxyIp),
    port: program.remoteProxyPort
  });
}
