// Import config.js
var config        = require('./config');

// Core package for dev
var gulp          = require('gulp');
var clean         = require('gulp-clean');
var browserSync   = require('browser-sync').create();
var changed       = require('gulp-changed');
var pug           = require('gulp-pug');
var zip           = require('gulp-zip');
var dFile         = require('gulp-delete-file');
var sass          = require('gulp-sass');
var autoprefixer  = require('gulp-autoprefixer');
var plumber       = require('gulp-plumber');
var uglify        = require('gulp-uglify');
var jshint        = require('gulp-jshint');
var concat        = require('gulp-concat');

// NodeJS core package
var colors        = require('colors');

// Declaring paths variable
var source        = config.source;
var site          = config.site;

var markup = {
  in_html   : source + config.markup + config.filename.htmlFile,
  in_pug    : source + config.markup + config.filename.pugFile,
  out       : site
};

var styles = {
  in        : source + config.assetsPath.sass + config.filename.sassFile,
  out       : site + config.assetsPath.css,
  envOpt    : config.projEnv !== 'production' ? 'nested' : 'compressed'
};

var images = {
  in        : source + config.assetsPath.img,
  out       : site + config.assetsPath.img
};

var js = {
  in        : source + config.assetsPath.js,
  out       : site + config.assetsPath.js,
  jsEnvOpt  : config.projEnv !== 'production'
};

// Clean site folder
gulp.task('clean', () => {
  console.log('---------] => Cleaning site folder'.yellow);
  return gulp.src([site + '*', '!' + site + '.gitkeep'], {read: false})
    .pipe(clean());
});

// Compiling index.pug to index.html in site folder
gulp.task('toPug', () => {
  console.log('---------] => Compiling pug/jade to html'.yellow);
  return gulp.src(markup.in_pug)
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(site));
});

// Copying static html file if you dont using pug.
gulp.task('copyHTML', () => {
  console.log('---------] => Copying static html to site folder'.yellow);
  return gulp.src(markup.in_html)
    .pipe(plumber())
    .pipe(changed(site))
    .pipe(gulp.dest(site));
});

// Copying img file
gulp.task('copyImg', ['cleanImgSite'], () => {
  console.log('---------] => Copying image'.yellow);
  return gulp.src(images.in + '*')
    .pipe(changed(images.out))
    .pipe(gulp.dest(images.out))
    .pipe(browserSync.stream());
});

gulp.task('cleanImgSite', () => {
  return gulp.src(images.in + '*')
    .pipe(clean());
});

// Compile sass or scss to css and add autoprefix for crossbrowser
gulp.task('toCSS', () => {
  console.log('---------] => Compiling sass to css in '.yellow + config.projEnv.yellow + ' mode'.yellow);
  return gulp.src(styles.in)
    .pipe(plumber())
    .pipe(sass({
      precision: 3,
      outputStyle: styles.envOpt
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', '> 1%', 'IE 8'],
      cascade: true
    }))
    .pipe(gulp.dest(styles.out))
    .pipe(browserSync.reload({ stream: true}));
});

// Javascript process like minifying and concat
gulp.task('jsCompose',() => {
  if (js.jsEnvOpt) {
    console.log('---------] => Compose JS in development mode'.yellow);
    return gulp.src([js.in + '*.js', js.in + 'lib/*.js', '!' + js.in + 'vendors/*.js' ])
      .pipe(plumber())
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'))
      .pipe(concat('main.js'))
      .pipe(gulp.dest(js.out));
  } else {
    console.log('---------] => Compose JS in production mode'.yellow);
    return gulp.src([js.in + '*.js', js.in + 'lib/*.js', '!' + js.in + 'vendors/*.js' ])
      .pipe(plumber())
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'))
      .pipe(concat('main.js'))
      .pipe(uglify())
      .pipe(gulp.dest(js.out));
  }

});

// Copy third party js libs
gulp.task('copyVendors', () => {
  console.log('---------] => Copying vendors (third party library here)'.yellow);
  return gulp.src(js.in + 'vendors/*.js')
    .pipe(changed(js.out + 'vendors'))
    .pipe(gulp.dest(js.out + 'vendors'));
});

// Zipping file for production or archive it
gulp.task('zipit', () => {
  var zipParam = process.argv[3];

  switch(zipParam){
    case '--all':
      console.log('---------] => Compress all project to root directory'.yellow);
      gulp.src(['./*', '!node_modules'])
        .pipe(zip(config.name + '.zip'))
        .pipe(gulp.dest('./'));
      break;
    case '--site-only':
      console.log('---------] => Compress all inside site folder to root directory'.yellow);
      gulp.src(site + '*')
        .pipe(zip(config.name + '.zip'))
        .pipe(gulp.dest('./'));
      break;
    default:
      console.log('---------] => Options not correct!'.red);
      break;
  }
});

// Run browserSync
gulp.task('syncSite', () => {
  console.log('---------] => Starting browser-sync'.yellow);
  browserSync.init({
    server: {
      baseDir: site,
      index: 'index.html'
    },
    open: 'local'
  })
});

// Build
gulp.task('build', ['copyHTML', 'toCSS','jsCompose', 'copyVendors'], () => {
  console.log('---------] => Your in' + config.projEnv + 'mode'.yellow);
  console.log('---------] => Your project name: ' + config.name + '. Building ...'.yellow);

});
gulp.task('build-with-pug', ['toPug', 'toCSS','jsCompose', 'copyVendors'], () => {
  console.log('---------] => Your in '.yellow + config.projEnv.yellow + ' mode'.yellow);
  console.log('---------] => Your project name: '.yellow + config.name.yellow + '. Building project with pug template enable...'.yellow);
});

// Command serve
gulp.task('serve', ['build', 'syncSite'], () => {
  console.log('---------] => Serving project and watch for change'.yellow);
  // Watch index.html
  gulp.watch(['./src/markup/index.html'], ['copyHTML', browserSync.reload]);

  // Watch js folder and vendors folder
  gulp.watch(['./src/assets/js/*.js', './src/assets/js/lib/*.js'], ['jsCompose', browserSync.reload]);
  gulp.watch('./src/assets/js/vendors/*.js', ['copyVendors', browserSync.reload]);

  // watch sass folder
  gulp.watch('./src/assets/styles/style.{sass,scss}', ['toCSS'] );

  // Watch image folder
  gulp.watch('./src/assets/img/', ['copyImg']);
});

// serve-with-pug task
gulp.task('serve-with-pug', ['build-with-pug', 'syncSite'], () => {
  console.log('---------] => Serving project and watch for change with pug template enable'.yellow);
  // Watch index.html
  gulp.watch(['./src/markup/index.pug'], ['toPug', browserSync.reload]);

  // Watch js folder and vendors folder
  gulp.watch(['./src/assets/js/*.js', './src/assets/js/lib/*.js'], ['jsCompose', browserSync.reload]);
  gulp.watch('./src/assets/js/vendors/*.js', ['copyVendors', browserSync.reload]);

  // watch sass folder
  gulp.watch('./src/assets/styles/style.{sass,scss}', ['toCSS'] );

  // Watch image folder
  gulp.watch('./src/assets/img/', ['copyImg']);
});

// help task
gulp.task('help', () => {
  console.log('|-------------------------------------------------------------------|');
  console.log('|================= FRONTEND DEVELOPMENT KIT HELP ===================|');
  console.log('|-------------------------------------------------------------------|');
  console.log('|                                                                   |');
  console.log('| Usage             : gulp [command]                                   |');
  console.log('| The commands for the task runner are the following.               |');
  console.log('|-------------------------------------------------------------------|');
  console.log('| help              : Print this message                            |');
  console.log('| clean             : Clean all compiled files on ./site folder     |');
  console.log('| zipit [option]    : Compress project                              |');
  console.log('|       --all       : Compress all files and folder                 |');
  console.log('|       --site-only : Compress compiled files in the site folder    |');
  console.log('|                                                                   |');
  console.log('| serve             : Compile, watch, and start browser-sync        |');
  console.log('| serve-with-pug    : Like serve but using pug template for html    |');
  console.log('| build             : Compile project only                          |');
  console.log('| build-with-pug    : Like build but using pug template for html    |');
  console.log('|                                                                   |');
  console.log('|-------------------------------------------------------------------|');
});

gulp.task('default', ['help']);
