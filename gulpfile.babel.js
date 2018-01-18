// @flow fuck off
import gulp from 'gulp'
import through from 'through2'
import chalk from 'chalk'
import path from 'path'

const $ = require('gulp-load-plugins')()

function swapSrcWithDist (src) {
  return src.replace(/\bsrc\b/, 'dist')
}

const packages = './packages/*/src/**/*.js'

gulp.task('build', () => {
  const base = path.join(__dirname, 'packages')

  return gulp
    .src(packages, { base })
    .pipe($.plumber({
      errorHandler (err) {
        $.util.log(err.stack)
      },
    }))
    .pipe($.changed('dist', {
      transformPath: swapSrcWithDist,
    }))
    .pipe(through.obj((file, enc, callback) => {
      $.util.log('Compiling', `'${chalk.cyan(file.relative)}'...`)
      callback(null, file)
    }))
    .pipe($.babel())
    .pipe(through.obj((file, enc, callback) => {
      // Passing 'file.relative' because $.newer() above uses a relative
      // path and this keeps it consistent.
      file.path = path.resolve(file.base, swapSrcWithDist(file.relative))
      callback(null, file)
    }))
    .pipe(gulp.dest(base))
})

gulp.task(
  'watch',
  gulp.series('build', () => {
    return gulp.watch(packages, { debounceDelay: 200 }, gulp.parallel('build'))
  }),
)

gulp.task('default', gulp.parallel('build'))
