const pathNode = require('path');
const chalk = require('chalk');

const migration = require('../migration');

function start(path, options) {
  const newVersion = '1.0.0';
  const previousVersion = '4';
  const dependenciesExcluded = ['@totvs/thf-kendo', '@totvs/thf-theme-kendo'];

  const srcPath = pathNode.join(path, 'src');
  const angularPath = pathNode.join(path, 'angular.json');
  const packagePath = pathNode.join(path, 'package.json');

  try {
    migration.fileReader.setup(options);

    const checkVersion = migration.changePortinariVersion(
      packagePath, previousVersion, newVersion, dependenciesExcluded);

    if (checkVersion) {
      migration.convertDirectory(srcPath);
      migration.fileReader.replacer(angularPath);
      migration.fileReader.replacer(packagePath);
    } else {
      console.log(chalk.yellow('ATENÇÃO: '), 'Não foi possível realizar a conversão!');
      console.log(chalk.yellow(`É necessário que o projeto esteja com a versão ${previousVersion} do THF.`));
    }


  } catch(e) {
    console.error(e);
  }

}

module.exports = start