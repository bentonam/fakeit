// this is disabled because it should be :mixed but flow freaks out
// because you can't use _.merged with type mixed.
/* eslint-disable
  flowtype/no-types-missing-file-annotation,
  flowtype/require-parameter-type,
  flowtype/require-return-type,
  import/no-dynamic-require,
  global-require
*/
export default function requirePkg (pkg) {
  pkg = require(pkg)

  return pkg.default ? pkg.default : pkg
}
