// including plugins
var gulp = require('gulp')
, uglify = require("gulp-uglify")
, babel  = require("gulp-babel")
, concat = require("gulp-concat");

// Build minified javascript
gulp.task('default', function () {
  let scripts = [
    'js/mobile.js',
    'js/note.js',
    'js/instrument.js',
    'js/interface.js',
    'js/echoplay.js',
    'js/midi.js'
  ]
    gulp.src(scripts)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(concat('app.echoplay.min.js'))
    .pipe(gulp.dest('js/'));
});
