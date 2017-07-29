module.exports = function (grunt) {
    grunt.initConfig({
        watch: {
            pug: {
                files: ['views/**'],
                options: {
                    livereload: true  // 判断文件改动是否重新启动服务
                }
            },
            js: {
                files: ['statics/js/**', 'models/**/*.js', 'schemas/**/*.js'],
                //tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            uglify: {
                files: ['public/**/*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            styles: {
                files: ['public/**/*.styl'],
                tasks: ['stylus'],
                options: {
                    nospawn: true
                }
            }
        },
        nodemon: {
            dev: {
                script: 'app.js',  // 指定入口文件
                options: {
                    args: [],
                    nodeArgs: ['--inspect'],
                    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
                    ext: 'js',
                    watch: ['./'],
                    delay: 1000, // 当有大量更新时延迟重启
                    env: {
                        PORT: '3000'
                    },
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        }
    })

    grunt.loadNpmTasks('grunt-contrib-watch') // 当有文件更新创建就重新执行任务
    //Run predefined tasks whenever watched file patterns are added, changed or deleted. 自动刷新
    grunt.loadNpmTasks('grunt-nodemon') // 监听入口文件发生改动就重启node任务
    grunt.loadNpmTasks('grunt-concurrent') // Run grunt tasks concurrently 并发执行任务

    grunt.option('force', true) // 强制执行，即使有语法错误
    grunt.registerTask('default', ['concurrent']) // 注册任务
}