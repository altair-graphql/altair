#!/usr/bin/env node
// @ts-check
/**
 * Deploy helper based on the deploy script
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const execa = require('execa');
const compareVersions = require('compare-versions');
const pkg = require('../package.json');
const SEMVER_REGEX = /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/;

function createLogger() {
  const ui = new inquirer.ui.BottomBar();

  return function(msg) {
    ui.log.write(chalk.green(msg));
  };
}

async function main() {
  try {
    const log = createLogger();
    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'deployedAPI',
        message: 'Have you deployed the API service?',
        default: true,
      },
    ]);
    const { haveCheckedDocs, newVersion } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'haveCheckedDocs',
        message:
          'Have you checked that docs are up to date? (settings options, pre request script API, supported languages)',
        default: false,
      },
      {
        type: 'input',
        name: 'newVersion',
        message: 'What is the new version?',
        validate: function(value) {
          if (!value.match(SEMVER_REGEX)) {
            return 'Please enter a valid version (e.g. 3.2.1)';
          }

          if (compareVersions(value, pkg.version) < 0) {
            return 'New version must be newer than the current version';
          }

          return true;
        },
      },
    ]);

    if (!haveCheckedDocs) {
      log('Check docs and try again.');
      return;
    }

    log('Making sure local repo is up to date...');
    // TODO: checkout staging
    // await syncRepo();
    log('Running tests...');
    // await runTests();
    log('Updating version in files...');
    await updateVersion(newVersion);
    log('Building browser extensions...');
    await buildExtensions();
    log(
      'Now you can verify that the extensions work as expected. (You can verify firefox using ./bin/run_ext_firefox.sh)'
    );
    const { haveVerifiedExtensions } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'haveVerifiedExtensions',
        message: 'Have you checked that the extension builds work as expected?',
        default: true,
      },
    ]);
    log('Creating upgrade commit...');
    await createVersionCommit(newVersion);
    log('Syncing with remote...');
    await syncRepo();
    log('Creating release tag...');
    await createReleaseTag(newVersion);
    log('Pushing release tag...');
    await pushReleaseTag();
    // log('Running release command for release notes...');
    // await startReleaseNotes();
    log('Create a staging to master PR');
    log(
      'Now wait till all the CI builds are completed, and the binaries have been published in Github release'
    );
    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'haveVerifiedExtensions',
        message: 'Have all the CI builds completed?',
        default: true,
      },
    ]);
    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'haveVerifiedExtensions',
        message: 'Merge the staging branch with master',
        default: true,
      },
    ]);
    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'haveVerifiedExtensions',
        message: 'Upload updated browser extensions',
        default: true,
      },
    ]);
    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'checkDocsUpdated',
        message: 'Check that docs have been updated',
        default: true,
      },
    ]);
    log("C'est fini! 🎉");
  } catch (error) {
    console.error(error);
  }
}
main();

const exec = async (file, arguments = [], options = {}) => {
  // @ts-ignore
  const subprocess = execa(file, arguments, { stdio: 'inherit', ...options });
  // subprocess.stdout.pipe(process.stdout);

  await subprocess;
};

const syncRepo = async () => {
  return exec('sh', [
    '-c',
    `until git pull --rebase && git push; do echo '\''Retrying...'\''; done`,
  ]);
};

const runTests = async () => {
  return exec('yarn', ['test']);
};

const buildExtensions = async () => {
  return exec('yarn', ['build-ext']);
};

const updateVersion = async version => {
  return exec('./bin/update_version.sh', [version]);
};

const createVersionCommit = async version => {
  await exec('git', ['add', '--all']);
  await exec('git', [
    'commit',
    '--allow-empty',
    '-am',
    `Upgraded to v${version}`,
  ]);
  await syncRepo();
};

const createReleaseTag = async version => {
  return exec('./bin/create_tag.sh', [`v${version}`]);
};

const pushReleaseTag = async () => {
  return exec('git', ['push', '--tags']);
};

const startReleaseNotes = async () => {
  return exec('release');
};
