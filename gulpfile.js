const {
    src,
    dest,
    series,
    parallel,
    watch
} = require('gulp');

function task_default(cb){
    console.log('gulp ok');
    cb();
}

exports.default = task_default;

//A任務
function task_a(cb){
    console.log('a mission');
    cb();
}
//B任務
function task_b(cb){
    console.log('b mission');
    cb();
}

//有順序的執行任務
exports.async =series(task_a, task_b);

//同時執行任務
exports.sync = parallel(task_a, task_b);

// 打包資料夾搬家到另一個資料夾
function package(){
    return src('src/style.css').pipe(dest('dist'))
}

exports.p = package;





const rename = require('gulp-rename');

// 壓縮css
const cleanCSS = require('gulp-clean-css');

function minicss(){
    return src('src/*.css').pipe(cleanCSS()).pipe(rename({
        extname: '.min.css'
    })).pipe(dest('dist'))
}
exports.c = minicss;



//壓縮js
const uglify = require('gulp-uglify');

function minijs(){
    return src('src/js/*.js').pipe(uglify()).pipe(rename({
        //extname: '.min.js'  //修改副檔名
        //prefix: 'web-' //增加前綴字
        //suffix: '-min' //增加後綴字
        basename: 'all' //更名
    })).pipe(dest('dist/js'))
}
exports.ugjs = minijs;


//整合所有檔案

const concat = require('gulp-concat');

function concatall_css(){
    return src('src/*.css')
    .pipe(concat('all.css'))
    .pipe(cleanCSS())  //minify css
    .pipe(dest('dist/css'));
}

exports.allcss = concatall_css;



const sourcemaps = require('gulp-sourcemaps');
//sass編譯
const sass = require('gulp-sass')(require('sass'));

function sassStyle() {
    return src('src/sass/*.scss')
        .pipe(sourcemaps.init())
        // .pipe(sass.sync().on('error', sass.logError))
        .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError)) //壓縮
        //.pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(dest('./dist/css'));
}

exports.scss = sassStyle;


//合併html

const fileinclude = require('gulp-file-include');

function includeHTML() {
    return src('src/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest('./dist'));
}

exports.html= includeHTML


// 監看整體
function watchall(){
    watch(['src/*.html','src/layout/*.html'], includeHTML);
    watch(['src/sass/*.scss', 'src/sass/**/*.scss'], sassStyle);
    watch('src/js/*.js', minijs);
}
exports.w = watchall



const browserSync = require('browser-sync');
const reload = browserSync.reload;


function browser(done) {
    browserSync.init({
        server: {
            baseDir: "./dist",
            index: "index.html"
        },
        port: 3000
    });
    watch(['src/*.html' , 'src/layout/*.html' ,] , includeHTML).on('change' , reload);
    watch(['src/sass/*.scss' , 'src/sass/**/*.scss'] , sassStyle).on('change' , reload);
     watch(['src/js/*.js' , 'src/js/**/*.js'] , minijs).on('change' , reload);
     watch(['src/img/*.*' ,  'src/img/**/*.*'] , package).on('change' , reload);
    done();
}
exports.default = series(parallel(includeHTML , sassStyle, minijs ,package),browser)    

//.default即為預設，只要終端機打gulp就執行
