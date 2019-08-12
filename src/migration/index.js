const fileSystem = require('fs');
const path = require('path');
const fileReader = require('./replace.js');

// Lendo o diretório
function convertDirectory(directory) {
  const files = fileSystem.readdirSync(directory);

  for (let i=0; i < files.length; i++) {
    // path.step recupera o separador específico do SO
    const file = `${directory}${path.sep}${files[i]}`;

    if((/(\.(gif|jpg|jpeg|tiff|png|ico|git))|(node_modules)$/i).test(file)) {
      continue;
    }

    const stats = fileSystem.statSync(file);

    if(stats.isFile()) {
      fileReader.replacer(file);

    } else if(stats.isDirectory()) {
      convertDirectory(file);
    }
  }
}

function changePortinariVersion(
  packageJsonFile,
  dependencyPrefix,
  previousVersion,
  newVersion,
  dependenciesExcluded) {

  const packageJson = fileReader.getFileSync(packageJsonFile);
  const previousVersionRegex = new RegExp(`^(\\^|\\~)?${previousVersion}\\..*$`);

  // não deve validar se as dependencias @totvs/mingle e @totvs/mobile-theme estão na versão 4.
  const unvalidatedDependencies = ['@totvs/mingle', '@totvs/mobile-theme'];

  for (const dependency in packageJson.dependencies) {

    if (dependency.startsWith(dependencyPrefix) &&
        !unvalidatedDependencies.includes(dependency) &&
        !previousVersionRegex.test(packageJson.dependencies[dependency])) {

      return false;
    
    } else if (dependency.startsWith(dependencyPrefix) && !dependenciesExcluded.includes(dependency)) {
      
      packageJson.dependencies[dependency] = newVersion;

    }
  
  };

  fileReader.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2));

  return true;
}

module.exports = { changePortinariVersion, convertDirectory, fileReader };