const isEmpty = obj => !Object.keys(obj).length

const pruneNonDuplicates = ({ moduleMap }) => {
  Object.keys(moduleMap).forEach(name => {
    const versions = moduleMap[name]
    Object.keys(versions).forEach(version => {
      if (versions[version].length === 1) {
        delete versions[version]
      }
    })

    if (isEmpty(versions)) {
      delete moduleMap[name]
    }
  })
}

module.exports = {
  pruneNonDuplicates
}
