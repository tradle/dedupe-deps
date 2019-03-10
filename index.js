const path = require('path')
const extend = require('lodash/extend')
const { mapDeps } = require('./map-deps')
const { pruneNonDuplicates } = require('./prune')
const { replaceFiles } = require('./replace-files')

const dryRunReplaceFiles = opts => replaceFiles(extend({ dryRun: true }, opts))

const dedupeDeps = async ({ dir, dryRun }) => {
  if (!(path.isAbsolute(dir) && dir.endsWith(`${path.sep}node_modules`))) {
    throw new Error('expected "dir" to be an absolute path to the top level node_modules dir')
  }

  const moduleMap = await mapDeps({ dir })
  pruneNonDuplicates({ moduleMap })
  await Promise.all(
    Object.keys(moduleMap).map(name =>
      dedupeModule({
        name,
        versions: moduleMap[name],
        replaceFiles: dryRun ? dryRunReplaceFiles : replaceFiles
      })
    )
  )
}

const dedupeModule = ({ name, versions, replaceFiles }) =>
  Promise.all(
    Object.keys(versions).map(version => {
      const [canonical, ...duplicates] = versions[version]
      return Promise.all(duplicates.map(duplicate => replaceFiles({ name, canonical, duplicate })))
    })
  )

module.exports = {
  dedupe: dedupeDeps
}
