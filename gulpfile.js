var gulp = require('gulp');
var imageResize = require('gulp-image-resize');
var imageOptim = require('gulp-imageoptim');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var imageop = require('gulp-image-optimization');
var uglyfly = require('gulp-uglyfly');


gulp.task('imageResize', ['images'], function () {
  gulp.src('dist/img/*.jpg')
    .pipe(imageResize({
      width : 300,
      height : 300,
      crop : true,
      upscale : false
    }))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('images', function(cb) {
    gulp.src(['src/img/*.jpg']).pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })).pipe(gulp.dest('dist/img')).on('end', cb).on('error', cb);
});
 
gulp.task('compress', function() {
  gulp.src('src/js/*.js')
    .pipe(uglyfly())
    .pipe(gulp.dest('dist/js'))
});

gulp.task('minify', function() {
  return gulp.src('src/index.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});


gulp.task('minify-css', function() {
  return gulp.src('src/css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist/css'));
});