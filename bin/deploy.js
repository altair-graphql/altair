#!/usr/bin/env node

function log(output) {
    process.stdout.write(output);
    process.stdout.write('\n');

}
function execute(command, output = true) {
    const exec = require('child_process').exec;

    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (output) {
                process.stdout.write(stdout);
                process.stderr.write(stderr);
            }
            resolve(stdout);
            if (err) {
            console.error('Error while executing: ', err);
            return reject(err);
            }
        });
    });
}


//   https://www.dev2qa.com/node-js-get-user-input-from-command-line-prompt-example/

/*
  Prequisites
  - Have release package installed globally
  - Have right to publish



    Deploy steps
    ============
    - Check that there is package.json and the package name is altair
    - Switch to master
*/

async function deploy() {
    log('Checking prerequisites...');
    try {
        const hasRelease = await execute('release -v', false);
    } catch(err) {

    }
}

deploy();