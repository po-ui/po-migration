const fileReader = require('./replace');

async function updateStylesOfProjects(angularPath) {
  const theme = 'node_modules/@totvs/portinari-theme/css/po-theme-default.min.css';
  
  const fileContent = await fileReader.getFile(angularPath);
  const angularJson = JSON.parse(fileContent);

  for (const [, project] of Object.entries(angularJson.projects)) {
    if (project.projectType === 'application') {

      updateThemeInProjectStyles(project, 'build', theme);
      updateThemeInProjectStyles(project, 'test', theme);
    }
  }

  return fileReader.writeFile(angularPath, JSON.stringify(angularJson, null, 2));
}

function updateThemeInProjectStyles(project, targetName, theme) {
  const targetOptions = getProjectTargetOptions(project, targetName);

  if (targetOptions.styles) {
    const styles = targetOptions.styles;
    const styleRegex = /node_modules\/(@totvs\/thf-theme)|(@portinari\/style)/;

    const styleIndex = styles.findIndex(style => styleRegex.test(style));
    if (styleIndex > -1) {
      styles.splice(styleIndex, 1, theme);
    }
  }
}

function getProjectTargetOptions(project, targetName) {

  if (project.architect &&
      project.architect[targetName] &&
      project.architect[targetName].options) {

    return project.architect[targetName].options;
  }

}

module.exports = {
  updateStylesOfProjects
};