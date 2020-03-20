const chalk = require('chalk');
const migration = require('../migration');
const package = require('../migration/package');
const pathNode = require('path');
const version = require('../migration/version');
const workspace = require('../migration/workspace');

const defaultTheme = 'totvs';

async function start(path, options) {
  const previousVersion = '4';
  const dependenciesExcluded = ['@totvs/thf-kendo', '@totvs/thf-theme-kendo'];
  const theme = options.theme ? options.theme : defaultTheme;

  const srcPath = pathNode.join(path, 'src');
  const angularPath = pathNode.join(path, 'angular.json');
  const packagePath = pathNode.join(path, 'package.json');

  try {
    migration.fileReader.setup(options);

    const checkVersion = migration.changePoVersion(packagePath, previousVersion, version, dependenciesExcluded);

    if (checkVersion) {
      migration.convertDirectory(srcPath);

      await migration.fileReader.replacer(angularPath);
      await migration.fileReader.replacer(packagePath);

      await configTheme(theme, angularPath, packagePath);

      package.install();
    } else {
      console.log(chalk.yellow('ATENÇÃO: '), 'Não foi possível realizar a conversão!');
      console.log(chalk.yellow(`É necessário que o projeto esteja com a versão ${previousVersion} do THF.`));
    }
  } catch (e) {
    console.error(e);
  }
}

function configTheme(theme, angularPath, packagePath) {
  if (theme && theme.toLowerCase() === defaultTheme) {
    const insertThemePromise = workspace.updateStylesOfProjects(angularPath);
    const dependencyPromise = package.addDependency(packagePath, '@totvs/portinari-theme', version);

    return Promise.all([insertThemePromise, dependencyPromise]);
  }

  return Promise.resolve();
}

module.exports = start;
