const path = require('path')
const findFiles = require('findit')

const findModuleFilesWithExtensions = (dupDir, extensions) => {
  const finder = findFiles(dupDir)
  const toRemap = []
  finder.on('file', file => {
    const ext = path.extname(file)
    if (!extensions.includes(ext)) return

    const rel = path.relative(dupDir, file)
    if (rel.includes('/node_modules/')) return

    toRemap.push(rel)
  })

  return new Promise((resolve, reject) => {
    finder.on('end', () => resolve(toRemap))
    finder.on('error', reject)
  })
}

const findModuleJsFiles = dir => findModuleFilesWithExtensions(dir, ['.js'])

module.exports = {
  findModuleFilesWithExtensions,
  findModuleJsFiles
}
