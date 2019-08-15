const chalk = require('chalk');
const spawn = require('cross-spawn');
const fileReader = require('./replace');

function install() {
  console.log(chalk.white.bold('Instalando os pacotes...'));

  return new Promise((resolve, reject) => {
    let command = 'npm';
    let args = ['install'];

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`
        });
        return;
      }

      console.log();
      console.log(chalk.white.bold('Pacotes instalados com sucesso!'));
      resolve();
    })
  })
};

async function addDependency(packagePath, package, version) {
  const packageContent = await fileReader.getFile(packagePath);

  const packageJson = JSON.parse(packageContent);

  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  if (!packageJson.dependencies[package]) {
    packageJson.dependencies[package] = version;
    packageJson.dependencies = sortObjectByKeys(packageJson.dependencies);
  }

  return fileReader.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
}

function sortObjectByKeys(obj) {
  return Object.keys(obj).sort().reduce((result, key) => (result[key] = obj[key]) && result, {});
}

module.exports = { install, addDependency };