const fileSystem = require('fs');
const chalk = require('chalk');

let replaceAllWords = false;

function setup(options) {
  replaceAllWords = options.all;
}

function getKeyWordsJson() {
  const fileNameKeyWords = __dirname + '/keyWords.json';
  // fazer tratamento de erro 
  return getFileSync(fileNameKeyWords);
}

function getFileSync(fileName) {
  return JSON.parse(fileSystem.readFileSync(fileName, 'utf-8'));
}

function writeFileSync(fileName, data) {
  fileSystem.writeFileSync(fileName, data);
}

function getFile(fileName) {
  return new Promise((resolve, reject) => {
    fileSystem.readFile(fileName, 'utf-8', function(err, file){
      if (err) {
        reject(fileName)
      }

      resolve(file);
    });
  });
}

function writeFile (fileName, data) {
  return new Promise((resolve, reject) => {

    if (data) {
      fileSystem.writeFile(fileName, data, (err) => {
        if (err) {
          reject(fileName)
        }

        resolve(fileName);
      });
    } else {
      resolve()
    }

  });
}

function replaceFile(file) {
  let newFile;

  if (replaceAllWords) {
    // encontrar palavras que tenham thf ou que iniciam com t-
    newFile = file.replace(/(thf)|(\bt\-)|(totvs)/gi, replacePO);

  } else {
    newFile = replaceByKeyWords(file);
  }

  return newFile !== file ? newFile : undefined;
}

function replaceByKeyWords(file) {
  const keyWordsJson = getKeyWordsJson();

  const regex = new RegExp([
  '@totvs((\/thf\-ui)|',
  '(\/thf\-storage)|',
  '(\/thf\-templates)|',
  '(\/thf\-sync)|',
  '(\/thf\-code\-editor))',
  ].join(''), 'g');

  let newFile = file.replace(regex, '@portinari$1');

  newFile = replaceThemeDependency(newFile);

  for (const keyWord in keyWordsJson) {
    // regex para pegar apenas a palavra
    const regex = new RegExp(`\\b${keyWord}\\b`, 'gm');
    newFile = newFile.replace(regex, keyWordsJson[keyWord]);
  }

  return newFile;
}

function replacePO(thfString) {
  if (thfString.toLowerCase() === 'thf') {

    const firstLetter = thfString.charAt(0);
    const isUpper = word => word === word.toUpperCase();
    const isUpperCaseLetter = isUpper(firstLetter);
    const isUpperCaseWord = isUpper(thfString);

    return isUpperCaseWord ? 'PO' : (isUpperCaseLetter ? 'Po' : 'po');
  }

  if(thfString.toLowerCase() === 't-') {
    return 'p-';
  }

  if (thfString === 'totvs') {
    return 'portinari';
  }

  if (thfString === 'TOTVS') {
    return 'PORTINARI';
  }

  if (thfString === 'Totvs') {
    return 'Portinari';
  }
}

function onUpdate(filePath) {
  if (filePath) {
    console.log(chalk.green('ATUALIZADO: '), filePath);
  }
}

function onError(filePath) {
  console.log(chalk.red('Arquivo não encontrado: '), filePath);
}

// regex especifico para a troca do tema, ja que o mesmo não se enquadra no regex padrão.
function replaceThemeDependency(file) {
  const themeRegex = new RegExp('@totvs\/thf\-theme(?!\-kendo)', 'g');

  return file.replace(themeRegex, '@portinari/style');
}

function replacer(fileName) {
  return getFile(fileName)
    .then(file => replaceFile(file))
    .then(newDataFile => writeFile(fileName, newDataFile))
    .then(fileName => onUpdate(fileName))
    .catch(fileName => onError(fileName));
}

module.exports = {
  getFileSync,
  getFile,
  replacer,
  setup,
  writeFileSync,
  writeFile
}
