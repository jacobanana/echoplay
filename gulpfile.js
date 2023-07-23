// including plugins
var gulp = require('gulp')
, uglify = require("gulp-uglify")
, concat = require("gulp-concat");

// Build minified javascript
gulp.task('default', function () {
  let scripts = [
    'echoplay-server/js/mobile.js',
    'echoplay-server/js/note.js',
    'echoplay-server/js/instrument.js',
    'echoplay-server/js/interface.js',
    'echoplay-server/js/echoplay.js',
    'echoplay-server/js/midi.js'
  ]
    return gulp.src(scripts)
    .pipe(uglify())
    .pipe(concat('app.echoplay.min.js'))
    .pipe(gulp.dest('echoplay-server/js/'));
});
