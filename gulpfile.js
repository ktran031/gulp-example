/*eslint-env node */

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const jasmine = require('gulp-jasmine-phantom');
const concat = require('gulp-concat');
// const uglify = require('gulp-uglify');
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg'); 

// Default Tasks
gulp.task('default', ['imageMin', 'reload', 'scripts', 'copy-html', 'copy-images', 'styles', 'lint'], function() {
	gulp.watch('sass/**/*.scss', ['styles']);
    gulp.watch('js/**/*.js', ['lint']);
    gulp.watch('js/**/*.js', ['scripts']);
    gulp.watch('index.html', ['copy-html']);

	browserSync.init({
		server: './dist'
	});
});

// JS Concatenation Task
gulp.task('scripts', function() {
    gulp.src('js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
			presets: ['@babel/env']
		}))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js'));
});
gulp.task('scripts-dist', function () {
    gulp.src('js/**/*.js')
        .pipe(babel({
			presets: ['@babel/env']
		}))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js'));
});


// Copy HTML Task
gulp.task('copy-html', function() {
    gulp.src('./index.html')
        .pipe(gulp.dest('./dist'));
});

// Reloading Task
gulp.task('reload', function() {

// Auto reload html file
gulp.watch('./dist/index.html')
    .on('change', browserSync.reload);

// Auto reload css file
gulp.watch('./dist/css/**/*.css')
    .on('change', browserSync.reload);

// Auto reload js file
gulp.watch('./dist/js/**/*.js')
    .on('change', browserSync.reload);
});



// Copy images to dist Task
gulp.task('copy-images', function() {
    gulp.src('img/*')
        .pipe(gulp.dest('dist/img'));
});

// SASS Task
gulp.task('styles', function() {
    gulp.src('sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sass({outputStyle: 'compressed'}))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
        }))
        .pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

// ESLint Task
gulp.task('lint', function () {
	return gulp.src(['js/**/*.js'])
		// eslint() attaches the lint output to the eslint property
		// of the file object so it can be used by other modules.
		.pipe(eslint())
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failOnError last.
		.pipe(eslint.failOnError());
});

// Optimize Images task
gulp.task('imageMin', function() {
    gulp.src('img/*')
        .pipe(imagemin([
            imageminMozjpeg({
                quality: 50
            }),
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest('dist/img'));
});

// Jasmine Unit Testing Task
gulp.task('tests', function () {
	gulp.src('tests/spec/extraSpec.js')
		.pipe(jasmine({
			integration: true,
			vendor: 'js/**/*.js'
		}));
});

// Setting Up Production Task
gulp.task('dist', [
   'copy-html',
   'copy-images',
   'styles',
   'lint',
   'scripts-dist' 
]);