#!/usr/bin/env node
import CFonts from 'cfonts';
import chalk from 'chalk';
import clear from 'clear';
import program from 'commander';
import inquirer from 'inquirer';
import { Address4 } from 'ip-address';
import { isIPv4 } from 'net';
import pino from 'pino';
import { createConditionalForwardProxy } from './lib/proxy';

const logger = pino({
  name: 'CF-Proxy',
  prettyPrint: true
});

clear();
CFonts.say('CF-Proxy', {
  align: 'left', // define text alignment
  background: 'transparent', // define the background color, you can also use `backgroundColor` here as key
  colors: ['system'], // define all colors
  env: 'node', // define the environment CFonts is being executed in
  font: 'block', // define the font face
  gradient: '#ec6707,#f39200,#fbb900,#ffdd00,#c7d300,#94c11f,#28946b,#00798e', // define your two gradient colors
  independentGradient: false, // define if you want to recalculate the gradient for each new line
  letterSpacing: 1, // define letter spacing
  lineHeight: 1, // define the line height
  maxLength: '0', // define how many character can be on one line
  space: true, // define if the output text should have empty lines on top and on the bottom
  transitionGradient: true // define if this is a transition between colors directly
});

program
  .version('1.0.1')
  .description('A minimal HTTP / HTTPS forwarding proxy')
  .option('-p, --port <port>', 'Port. Default: 5050')
  .option('-ri, --remoteProxyIp <remoteIp>', 'Remote Proxy IP')
  .option('-rp, --remoteProxyPort <remotePort>', 'Remote Proxy Port')
  .option('-l, --logLevel', 'Loglevel')
  .parse(process.argv);

if (!program.port || !program.remoteProxyIp || !program.remoteProxyPort) {
  // tslint:disable-next-line: no-console
  console.log(chalk.bold.white.bgRed(' Missing configuration detected: '));

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
          if (isIPv4(input)) {
            return true;
          } else {
            return 'Must be an IPV4 Address. e.g. 158.80.164.3';
          }
        },
        when: () => !program.remoteProxyIp
      },
      {
        default: 3128,
        message: 'Remote Proxy Port',
        name: 'remoteProxyPort',
        type: 'number',
        validate: input => {
          if (input) {
            return typeof input === 'number';
          } else {
            return 'Must be a number';
          }
        },
        when: () => !program.remoteProxyPort
      }
    ])
    .then(answers => {
      const config = {
        port: program.port,
        remoteProxyIp: program.remoteProxyIp,
        remoteProxyPort: program.remoteProxyPort,
        ...answers
      };
      createConditionalForwardProxy(
        config.port,
        {
          host: new Address4(config.remoteProxyIp),
          port: config.remoteProxyPort
        },
        logger
      );
    })
    .catch(error => {
      if (error.isTtyError) {
        logger.error(error.message);
      } else {
        logger.error(error.message);
      }
    });
} else {
  createConditionalForwardProxy(
    program.port,
    {
      host: new Address4(program.remoteProxyIp),
      port: program.remoteProxyPort
    },
    logger
  );
}
