var elixir = require('laravel-elixir');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Less
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {
    mix.sass(['home/main.scss','home/leaflet.scss'] , 'public/resources/themes/default/css/frontoffice/home');
});


//  Minify JS
// gulp.task('minifyJS_backoffice', function() {
//   return gulp.src(['public/resources/js/backoffice/**/*.js', '!./public/resources/js/backoffice/**/*.min.js'])
//     .pipe(rename({
//       suffix: '.gulp.min'
//     }))
//     .pipe(uglify())
//     .pipe(gulp.dest('public/resources/js/backoffice'));
// });
// gulp.task('minifyJS_frontoffice', function() {
//   return gulp.src(['public/resources/js/frontoffice/**/*.js', '!./public/resources/js/frontoffice/**/*.min.js'])
//     .pipe(rename({
//       suffix: '.gulp.min'
//     }))
//     .pipe(uglify())
//     .pipe(gulp.dest('public/resources/js/frontoffice'));
// });
// gulp.task('default', ['minifyJS_backoffice','minifyJS_frontoffice']);
