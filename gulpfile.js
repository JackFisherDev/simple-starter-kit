const gulp = require('gulp')
const del = require('del')
const babel = require('gulp-babel')
const browserSync = require('browser-sync')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const precss = require('precss')
const autoprefixer = require('autoprefixer')
const htmlmin = require('gulp-htmlmin')
const cssnano = require('cssnano')
const imagemin = require('gulp-imagemin')
const imageminGuetzli = require('imagemin-guetzli')
const pngquant = require('imagemin-pngquant')
const rigger = require('gulp-rigger')
const reload = browserSync.reload

const path = {
    dist: {
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/main.js',
        css: 'src/css/main.css',
        img: {
            jpeg: 'src/img/**/*{jpg, jpeg}',
            another: ['src/img/**/*', '!src/img/**/*.{jpg, jpeg}']
        },
        fonts: 'src/fonts/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        css: 'src/css/**/*.css',
        img: {
            jpeg: 'src/img/**/*{jpg, jpeg}',
            another: ['src/img/**/*', '!src/img/**/*.{jpg, jpeg}']
        },
        fonts: 'src/fonts/**/*.*'
    }
}

const config = {
    server: {
        baseDir: "./dist"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Server started"
}

const clean = () => del(['.tmp', 'dist'])

const html = () => 
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(path.dist.html))
        .pipe(reload({ stream: true }))

const css = () => { 
    const plugins = [
        precss,
        autoprefixer,
        cssnano
    ]
    return gulp.src(path.src.css)
        .pipe(postcss(plugins))
        .pipe(rename({ extname: '.min.css'}))
        .pipe(gulp.dest(path.dist.css))
        .pipe(reload({ stream: true }))
}

const js = () => 
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js'}))
        .pipe(gulp.dest(path.dist.js))
        .pipe(reload({ stream: true }))

const images = () =>
    gulp.src(path.src.img.another)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dist.img))
        .pipe(reload({ stream: true }));

const jpeg = () => 
    gulp.src(path.src.img.jpeg)
        .pipe(imagemin([
            imageminGuetzli({
                quality: 84
            })
        ]))
        .pipe(gulp.dest(path.dist.img))
        .pipe(reload({ stream: true }))

const fonts = () =>
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts))

const watch = () => {
    browserSync(config)

    gulp.watch(path.watch.html, gulp.series(html))
    gulp.watch(path.watch.css, gulp.series(css))
    gulp.watch(path.watch.js, gulp.series(js))
    gulp.watch(path.watch.img.another, gulp.series(images))
    gulp.watch(path.watch.img.jpeg, gulp.series(jpeg))
    gulp.watch(path.watch.fonts, gulp.series(fonts))
}

const build = cb => {
    gulp.series(
        clean,
        gulp.parallel(
            html,
            css,
            js,
            images,
            jpeg,
            fonts
        )
    )(cb)
}

exports.watch = watch
exports.default = build