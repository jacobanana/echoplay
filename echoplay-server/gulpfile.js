// including plugins
var gulp = require('gulp')
, uglify = require("gulp-uglify")
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
    return gulp.src(scripts)
    .pipe(uglify())
    .pipe(concat('app.echoplay.min.js'))
    .pipe(gulp.dest('build/'));
});
