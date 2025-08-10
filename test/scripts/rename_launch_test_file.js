import fs from 'fs';
const LAUNCH_JSON_PATH = 'C:/apps/Chess2/.vscode/launch.json';
const getLaunchJsonTestFilePath = (name) => `\${workspaceRoot}/test/${name}`;
const getPackageJsonArgString = (name) => `set NODE_OPTIONS=--import tsx&&mocha --require tsx test/${name}`;

const PACKAGE_JSON_PATH = 'C:/apps/Chess2/package.json';

function renameLaunchTestFiles(newName) {
  try {
    const launchData = fs.readFile(LAUNCH_JSON_PATH);
    const launchObj = JSON.parse(launchData);

    const packageData = fs.readFile(PACKAGE_JSON_PATH);
    const packageObj = JSON.parse(packageData);

    launchObj.configurations.args[2] = getLaunchJsonTestFilePath(newName);
    packageObj.scripts.test = getPackageJsonArgString(newName);

    fs.writeFile(LAUNCH_JSON_PATH, JSON.stringify(launchObj, null, 2));
    fs.writeFile(PACKAGE_JSON_PATH, JSON.stringify(packageObj, null, 2));

  } catch (err) {
    console.log(err);
  }
}

export { renameLaunchTestFiles };