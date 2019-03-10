const path = require('path')
const { mapDeps } = require('./map-deps')
const { pruneNonDuplicates } = require('./prune')
const { replaceFiles } = require('./replace-files')

const dedupeNodeModules = async ({ dir }) => {
  if (!(path.isAbsolute(dir) && dir.endsWith(`${path.sep}node_modules`))) {
    throw new Error('expected "dir" to be an absolute path to the top level node_modules dir')
  }

  const moduleMap = await mapDeps({ dir })
  pruneNonDuplicates({ moduleMap })
  await Promise.all(
    Object.keys(moduleMap).map(name =>
      dedupeModule({
        name,
        versions: moduleMap[name]
      })
    )
  )
}

const dedupeModule = ({ name, versions }) =>
  Promise.all(
    Object.keys(versions).map(version => {
      const [canonical, ...duplicates] = versions[version]
      return Promise.all(duplicates.map(duplicate => replaceFiles({ name, canonical, duplicate })))
    })
  )

module.exports = {
  dedupe: dedupeNodeModules
}
