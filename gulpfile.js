'use strict';

var gulp = require('gulp'),
  debug = require('gulp-debug'),
  inject = require('gulp-inject'),
  tsc = require('gulp-typescript'),
  tslint = require('gulp-tslint'),
  sourcemaps = require('gulp-sourcemaps'),
  del = require('del'),
  Config = require('./gulpfile.config'),
  tsProject = tsc.createProject('tsconfig.json'),
  browserSync = require('browser-sync'),
  superstatic = require('superstatic'),
  wiredep = require('wiredep').stream,
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  replace = require('gulp-replace'),
  minifyCss = require('gulp-minify-css');

var config = new Config();

/**
 * Generates the app.d.ts references file dynamically from all application *.ts files.
 */
// gulp.task('gen-ts-refs', function () {
//     var target = gulp.src(config.appTypeScriptReferences);
//     var sources = gulp.src([config.allTypeScript], {read: false});
//     return target.pipe(inject(sources, {
//         starttag: '//{',
//         endtag: '//}',
//         transform: function (filepath) {
//             return '/// <reference path="../..' + filepath + '" />';
//         }
//     })).pipe(gulp.dest(config.typings));
// });

/**
 * Lint all custom TypeScript files.
 */
gulp.task('ts-lint', function () {
  return gulp.src(config.allTypeScript)
    .pipe(tslint())
    .pipe(tslint.report('prose'));
});

/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts', function () {
  var sourceTsFiles = [config.allTypeScript,                //path to typescript files
    config.libraryTypeScriptDefinitions]; //reference to library .d.ts files
                        

  var tsResult = gulp.src(sourceTsFiles)
    .pipe(sourcemaps.init())
    .pipe(tsc(tsProject));

  tsResult.dts.pipe(gulp.dest(config.tsOutputPath));
  return tsResult.js
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.tsOutputPath));
});

/**
 * Remove all generated JavaScript files from TypeScript compilation.
 */
gulp.task('clean-ts', function (cb) {
  var typeScriptGenFiles = [
    config.tsOutputPath + '/**/*.js',    // path to all JS files auto gen'd by editor
    config.tsOutputPath + '/**/*.js.map', // path to all sourcemap files auto gen'd by editor
    '!' + config.tsOutputPath + '/lib'
  ];

  // delete the files
  del(typeScriptGenFiles, cb);
});

/**
 * Inject the bower dependecies and app dependencies into index.html
 */
gulp.task('wiredep', function () {
  var target = gulp.src(config.source + 'index.html');
  var sources = gulp.src(config.allSources);

  return target.pipe(inject(sources, { relative: true }))
    .pipe(wiredep())
    .pipe(gulp.dest('./src'));
});

/**
 * Watch files changes and execute tasks.
 */
gulp.task('watch', function () {
  gulp.watch([config.allTypeScript], ['ts-lint', 'compile-ts', 'wiredep']);
});

/**
 * Serve the app in debug mode.
 */
gulp.task('debug', ['compile-ts', 'wiredep', 'watch'], function () {
  serveApp(['index.html', '**/*.js'], './src', 'debug');
});

/**
 * Remove the injected dependencies
 */
gulp.task('remove-dep', function () {
  return gulp.src(config.source + 'index.html')
    .pipe(replace(/<!-- (.*?):js -->([\S\s]*?)<!-- endinject -->/gmi, '<!-- inject:js -->\n<!-- endinject -->'))
    .pipe(replace(/<!-- (.*?):css -->([\S\s]*?)<!-- endinject -->/gmi, '<!-- inject:css -->\n<!-- endinject -->'))
    .pipe(gulp.dest(config.distFolder));
});

/**
 * Serve the app in release mode, uglify and concat dependencies.
 */
gulp.task('release', ['compile-ts', 'remove-dep'], function () {
  gulp.src(config.libStyles)
    .pipe(concat('vendors.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest(config.distFolder));
    
  gulp.src(config.allStyles)
  .pipe(concat('styles.css'))
  .pipe(minifyCss())
  .pipe(gulp.dest(config.distFolder));
  
  gulp.src(config.libScripts)
    .pipe(concat('vendors.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.distFolder));

  gulp.src(config.allJavaScript)
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.distFolder));

  gulp.src(config.distFolder + 'index.html')
    .pipe(inject(gulp.src([
      config.distFolder + 'vendors.css',
      config.distFolder + 'styles.css',
      config.distFolder + 'vendors.js',
      config.distFolder + 'app.js']), { relative: true }))
  //.pipe(inject(es.merge(vendorStream, appStream)))
    .pipe(gulp.dest(config.distFolder));
      
      serveApp(['index.html', '**/*.js'], './dist', 'silent');
  //   var vendorStream = gulp.src(config.libScripts)
  //     .pipe(concat('vendors.js'))
  //     .pipe(uglify())
  //     .pipe(gulp.dest(config.distFolder));
  // 
  //   var appStream = gulp.src(config.allJavascript)
  //     .pipe(concat('app.js'))
  //     .pipe(uglify())
  //     .pipe(gulp.dest(config.distFolder));
  // 
  //   gulp.src(config.distFolder + 'index.html')
  //     .pipe(inject(gulp.src([config.distFolder + '*.js'])))
  //     //.pipe(inject(es.merge(vendorStream, appStream)))
  //     .pipe(gulp.dest(config.distFolder));
});

gulp.task('default', ['ts-lint', 'compile-ts']);

///////////////////////////////////////////////////////////////////

/**
 * Serve the app
 */
function serveApp(files, baseDir, logLevel) {
  process.stdout.write('Starting browserSync and superstatic...\n');
  browserSync({
    port: 3000,
    files: files,
    injectChanges: true,
    logFileChanges: true,
    logLevel: logLevel || 'debug',
    logPrefix: 'angularin20typescript',
    notify: true,
    reloadDelay: 0,
    server: {
      baseDir: baseDir,
      middleware: superstatic({ debug: false })
    }
  });
}