[GRUNT中文文档](http://www.gruntjs.net/getting-started)

[利用 Grunt （几乎）无痛地做前端开发 (一)](http://q.pnq.cc/blog/2012/11/30/_grunt-1/)

[Grunt + Bower—前端构建利器](http://doc.okbase.net/Alex--Yang/archive/123625.html)

[Grunt中批量无损压缩图片插件－－Grunt-contrib-imagemin  ](http://handyxuefeng.blog.163.com/blog/static/45452172201391415246847/)

[用Grunt搭建基于LESS的前端html开发框架](http://www.douban.com/note/344324661/)
1. 安装Node.js
    http://nodejs.org/download/

2. 加速NPM安装
    npm install -g cnpm --registry=http://r.cnpmjs.org
    安装cnpm国内镜像, 以后所有npm命令换成用cnpm执行即可

3. 安装grunt
    npm install -g grunt-cli

4. 在工程目录下建立配置文件Gruntfile.js
    本例中, 所做的事情包括:
      a. 组合一些less到一个文件
      b. 用less编译不同版本的css
      c. 填充html模版并部署
      d. 实时侦听以上变化并自动做相应编译

  <!-- code begin -->
        module.exports = function(grunt) {
          grunt.initConfig({
             pkg: grunt.file.readJSON('package.json'),  
             concat: {
                        options: {
                                banner: '/*! APP.common.css@<%= pkg.name %> - v<%= pkg.version %> - ' +
                                        '<%= grunt.template.today("yyyy-mm-dd") %> */'
                            },
                            mobileLess: {
                              src: ['src/mobile/less/APP_common/*.less'],
                              dest: 'src/mobile/less/APP.common_grunt.less',
                         }
            },
            less: {
              development: {
                options: {
                  compress: false,
                  yuicompress: false
                },
                files: {
                  "css/APP.common.css": "src/mobile/less/APP.common_grunt.less",
                  "css/APP.web.index.css": "src/web/less/APP.web.index.less"
                }
              },
              production: {
                options: {
                  modifyVars: {
                            imagepath_page: '"/misc/images/"',
                            imagepath: '"/misc/images/"'
                  },
                  compress: true,
                  yuicompress: true,
                  optimization: 2
                },
                files: {
                  "css/pub/APP.common.css": "src/mobile/less/APP.common_grunt.less",
                  "css/pub/APP.web.index.css": "src/web/less/APP.web.index.less"
                }
              }
            },    
            htmlbuild: {
                        mobile: {
                                src: 'src/mobile/html/*.html',
                                desc: './',
                                options: {
                                        beautify: true,
                                        relative: true,
                                        sections: {
                                                layout: {
                                                        footbar: 'src/mobile/html/inc/footbar.html'
                                                }
                                        }
                                }
                        },
                        web: {
                                src: 'src/web/html/*.html',
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
                        'src/**/less/*.less',
                        'src/**/less/**/*.less'
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
                        'src/**/html/*.html',
                        'src/**/html/**/*.html'
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
  <!-- code end -->

5. 建立并配置 package.json
    在项目目录下运行 npm init , 填写出现的各种选项, 或者直接回车到完成
    打开生成的 package.json, 并添加 devDependencies 节点 --如果后续的编译出错, 往往是这里的版本号不够新

  <!-- code begin -->
        {
          "name": "html",
          "version": "0.0.0",
          "description": "",
          "main": "Gruntfile.js",
          "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1"
          },
          "author": "",
          "license": "ISC",
          "devDependencies": {
            "grunt": "~0.4.1",
            "grunt-contrib-concat": "~0.4.0",
            "grunt-contrib-less": "~0.11.0",
            "grunt-contrib-watch": "~0.6.1",
            "grunt-html-build": "~0.3.2"
          }
        }
  <!-- code end -->

6. 安装项目依赖包
    在项目目录下运行 cnpm install , 将把 package.json->devDependencies下注明的依赖包下载到 node_modules

7. 运行grunt
    在项目目录下执行 grunt 即可 

<--------------------------------- END --------------------------------->
参考文档:
http://ericnishio.com/blog/compile-less-files-with-grunt
http://www.xuanfengge.com/npm-installation-did-not-succeed-and-github-will-not-open-solutions.html
https://www.npmjs.org/package/grunt-html-build
https://www.npmjs.org/package/grunt-contrib-concat
https://www.npmjs.org/package/grunt-contrib-less
https://www.npmjs.org/package/grunt-contrib-watch

```
$ npm install -g grunt-init
$ git clone https://github.com/gruntjs/grunt-init-gruntfile.git ~/.grunt-init/gruntfile
$ mkdir ~/html/grunt
$ cd ~/html/grunt
$ grunt-init gruntfile
$ npm install
```
##grunt + bower
```
cd html/
$ mkdir grunt_bower
$ cd grunt_bower/
$ npm init
$ more package.json
$ grunt-init gruntfile
$ npm install bower -g
$ touch bower.json
$ vim bower.json
$ bower install angularjs --save
$ bower insall jquery --save
$ npm install grunt-bower-task --save-dev
$ pwd
$ vim Gruntfile.js
$ subl .
$ bower install angularjs --save
$ bower insall jquery --save
$ bower install jquery --save
$ npm install -g grunt-cli
$ grunt
$ npm install -g grunt
$ npm install
$ grunt bower
```
