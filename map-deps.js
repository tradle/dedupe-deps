const path = require('path')
const pProps = require('p-props')
const findFiles = require('findit')
const sortBy = require('lodash/sortBy')
const fs = require('./fs')

const readJson = async file => JSON.parse(await fs.readFile(file))
const getModuleNameFromPackageJsonPath = file =>
  file.slice(file.lastIndexOf('node_modules') + 'node_modules/'.length, file.length - '/package.json'.length)

const addPackageJson = async ({ moduleMap, rootDir, filePath }) => {
  const moduleName = getModuleNameFromPackageJsonPath(filePath)
  if (!moduleMap[moduleName]) {
    moduleMap[moduleName] = {}
  }

  const mapForModule = moduleMap[moduleName]
  const pkg = await readJson(filePath, 'utf8')
  if (!mapForModule[pkg.version]) {
    mapForModule[pkg.version] = []
  }

  const mapForModuleVersion = mapForModule[pkg.version]
  const pathRelativeRoot = `.${path.sep}node_modules${path.sep}${path.relative(rootDir, filePath)}`
  mapForModuleVersion.push({
    path: pathRelativeRoot,
    pkg
  })
}

const mapDeps = async ({ dir }) => {
  const finder = findFiles(dir)
  const pending = {}
  const moduleMap = {}
  finder.on('file', filePath => {
    if (filePath.endsWith('/package.json')) {
      pending[filePath] = addPackageJson({ moduleMap, filePath, rootDir: dir })
    }
  })

  await new Promise((resolve, reject) => {
    finder.on('error', reject)
    finder.on('end', resolve)
  })

  await pProps(pending)

  for (let name in moduleMap) {
    for (let version in moduleMap[name]) {
      moduleMap[name][version] = sortBy(moduleMap[name][version], 'path')
    }
  }

  return moduleMap
}

module.exports = {
  mapDeps
}
