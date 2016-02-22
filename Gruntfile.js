module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: '/*! all.css@<%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            mobileLess: {
                src: ['src/less/*.less'],
                dest: 'src/all.less'
            }
        },
        less: {
            development: {
                options: {
                    compress: false,
                    yuicompress: false
                },
                files: {
                    "css/all.css": "src/all.less"
                }
            },
            production: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    "css/prod/all.css": "src/all.less"
                }
            }
        },
        htmlbuild: {
            mobile: {
                src: 'src/html/*.html',
                desc: './',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        layout: {
                            footbar: 'src/html/inc/footbar.html'
                        }
                    }
                }
            },
            web: {
                src: 'src/html/*.html',
                desc: './'
            }
        },
        watch: {
            options: {
                livereload: true
            },
            grunt: {
                files: ['Gruntfile.js']
            },

            styles: {
                files: [
                    'src/less/*.less',
                    'src/*.less'
                ],
                tasks: [
                    'concat:mobileLess',
                    'less'
                ],
                options: {
                    nospawn: true
                }
            },
            htmls: {
                files: [
                    'src/html/*.html'
                ],
                tasks: [
                    'htmlbuild'
                ],
                options: {
                    nospawn: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-html-build');

    grunt.registerTask('default', ['watch']);
};