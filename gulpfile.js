import autoprefixer from 'gulp-autoprefixer';
import browserSync from 'browser-sync';
import cleanCSS from 'gulp-clean-css';
import del from 'del';
import imagemin from 'gulp-imagemin';
import gulp from 'gulp';
import gulpIf from 'gulp-if';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import terser from 'gulp-terser';

const isProductionBuild = process.env.NODE_ENV || 'production';

// source - исходники
// watch - файлы, за изменениями которых следит Gulp
// build - готовая сборка
// images - директории изображений для оптимизации
// clean - удаляемые директории при сборке
const path = {
    source: {
        pages: 'source/*.html',
        fonts: 'source/fonts/**/*.*',
        styles: 'source/styles/style.scss',
        images: 'source/images/**/*.*',
        scripts: 'source/scripts/**/*.js',
        copy: 'source/fonts/**/*',
    },
    watch: {
        pages: 'source/**/*.html',
        fonts: 'srs/fonts/**/*.*',
        styles: 'source/styles/**/*.scss',
        images: 'source/images/**/*.*',
        scripts: 'source/scripts/**/*.js',
    },
    build: {
        pages: 'build/',
        styles: 'build/styles/',
        fonts: 'build/fonts/',
        images: 'build/images/',
        scripts: 'build/scripts/',
        copy: 'build/',
    },
    clean: {
        build: 'build/',
    },
};

export const html = () => {
    return gulp.src(path.source.pages)
        .pipe(gulp.dest(path.build.pages)); // Помещение HTML-файлов в build
};

export const styles = () => {
    return gulp.src(path.source.styles)
        .pipe(plumber()) // Отслеживаение ошибок
        .pipe(gulpIf(!isProductionBuild, sourcemaps.init())) // Инициализация sourcemap
        .pipe(sass().on('error', sass.logError)) // Компиляция SCSS в CSS
        .pipe(autoprefixer()) // Добавление вендорных префиксов
        .pipe(cleanCSS({ // Минификация CSS
            format: 'keep-breaks',
            level: {
                1: {
                    specialComments: 0,
                }
            },
        }))
        .pipe(rename("style.min.css")) // Переименование файла стилей
        .pipe(gulpIf(!isProductionBuild, sourcemaps.write())) // Запись sourcemap
        .pipe(gulp.dest(path.build.styles)) // Помещение CSS-файлов в build
        .pipe(browserSync.stream()); // Обновление страницы без перезагрузки
};

const scripts = () => {
    return gulp.src(path.source.scripts)
        .pipe(plumber()) // Отслеживаение ошибок
        .pipe(gulpIf(!isProductionBuild, sourcemaps.init())) // Инициализация sourcemap
        .pipe(terser()) // Минификация JS
        .pipe(gulpIf(!isProductionBuild, sourcemaps.write())) // Запись sourcemap
        .pipe(gulp.dest(path.build.scripts)); // Помещение JS-файлов в build
};

export const images = () => {
    return gulp.src(path.source.images)
        .pipe(gulpIf(isProductionBuild, gulp.dest(path.build.images))) // Минификация изображений, если запущена сборка build
        .pipe(gulpIf(isProductionBuild, imagemin([ // Минификация изображений, если запущена сборка build
            imagemin.gifsicle({
                interlaced: true,
            }),
            imagemin.mozjpeg({
                quality: 75,
                progressive: true,
            }),
            imagemin.optipng({
                optimizationLevel: 5,
            }),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: true,
                },
                    {
                        cleanupIDs: false,
                    },
                ]
            }),
        ])))
        .pipe(gulpIf(isProductionBuild, gulp.dest(path.source.images))) // Помещение оптимзированных изображений в src
        .pipe(gulp.dest(path.build.images)); // Помещение изображений в build;
};

export const copy = () => { // Копирование файлов из src без дополнительных преобразований
    return gulp.src(path.source.copy, {base:"source/"})
        .pipe(gulp.dest(path.build.copy)); // Помещение файлов в build
};

export const cleanBuild = () => { // Полное удаление директории сборки - build
    return del(path.clean.build);
};

export const server = () => { // Инициализация локального сервера
    browserSync.init({
        ui: false,
        notify: false,
        ghostMode: false,
        localOnly: true,
        online: false,
        port: 8080,
        server: {
            baseDir: './build/',
        },
        startPath: "/index.html",
    });
};

export const reloadServer = (done) => { // Перезагрузка сервера
    browserSync.reload();
    done(); // Вызов callback для корректного завершения перезагрузки
};

export const watch = () => { // Слежение за изменениями
    gulp.watch(path.watch.pages, gulp.series(html, reloadServer));
    gulp.watch(path.watch.fonts, gulp.series(copy, reloadServer));
    gulp.watch(path.watch.images, gulp.series(images, reloadServer));
    gulp.watch(path.watch.styles, gulp.series(styles));
    gulp.watch(path.watch.scripts, gulp.series(scripts, reloadServer));
};

export const build = gulp.series( // Функция сборки build-версии - npm run build
    cleanBuild,
    html,
    images,
    styles,
    scripts,
    copy,
);

export default gulp.series( // Дефолтная функция запуска разработки - npm start
    cleanBuild,
    html,
    images,
    styles,
    scripts,
    copy,
    gulp.parallel(
        watch,
        server,
    ),
);
