// this is disabled because it should be :mixed but flow freaks out
// because you can't use _.merged with type mixed.
/* eslint-disable
  flowtype/no-types-missing-file-annotation,
  flowtype/require-parameter-type,
  flowtype/require-return-type,
  import/no-dynamic-require,
  global-require
*/
import path from 'path'

export default function requirePkg (pkg, root = process.cwd()) {
  if (/[./]{2,}/.test(pkg)) {
    pkg = path.resolve(root, pkg)
  }
  pkg = require(pkg)

  return pkg.default ? pkg.default : pkg
}
