module.exports = function(grunt) {

  var fs = require('fs'),
      path = require('path'),
      publicDir = 'public';

  grunt.initConfig({
    bgShell: {
      watch: {
        cmd: 'compass watch',
        bg: true
      }
    },
    compass: {
      compile: {
        options: {
          config: 'config.rb'
        }
      },
      forced: {
        options: {
          force: true,
          config: 'config.rb'
        }
      }
    },
    watch: {
      options: {
        nospawn: true
      },
      sass: {
        files: 'sass/**' // Compass watch
      },
      css: {
        files: 'css/**',
        tasks: 'notify:watch',
        options: {
          livereload: true
        }
      },
      img: {
        files: 'img/**',
        tasks: 'notify:watch',
        options: {
          livereload: true
        }
      },
      jade: {
        files: 'jade/*',
        tasks: ['jade:pretty', 'notify:watch']
      }
    },
    jade: {
      pretty: {
        files: {
          'public/index.html': ['jade/index.jade']
        },
        options: {
          client: false,
          pretty: true
        }
      },
      ugly: {
        files: {
          'public/index.html': ['jade/index.jade']
        },
        options: {
          client: false
        }
      }
    },
    symlink: {
      css: {
        target: path.resolve('css'),
        link: path.resolve('public') + '/css'
      },
      js: {
        target: path.resolve('js'),
        link: path.resolve('public') + '/js'
      },
      img: {
        target: path.resolve('img'),
        link: path.resolve('public') + '/img'
      },
      font: {
        target: path.resolve('font'),
        link: path.resolve('public') + '/font'
      }
    },
    notify: {
      watch: {
        options: {
          message: 'Watching for changes...'
        }
      }
    }
  });

  grunt.event.on('watch', function(action, filepath, target) {
    action = (function(action) {
      return action.charAt(0).toUpperCase() + action.slice(1);
    })(action);

    grunt.config(['notify', 'watch'], {
      options: {
        message: action + ': ' + filepath
      }
    });
  });

  deleteFolderRecursive(publicDir);
  grunt.file.mkdir(publicDir);

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-bg-shell');
  grunt.loadNpmTasks('grunt-symbolic-link');
  grunt.loadNpmTasks('grunt-notify');

  grunt.registerTask('default', ['jade:pretty', 'symlink', 'compass:forced', 'bgShell:watch', 'notify:watch', 'watch']);
  grunt.registerTask('build', ['jade:ugly', 'symlink', 'compass:forced']);

  function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
      files.forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.statSync(curPath).isDirectory() && !fs.lstatSync(curPath).isSymbolicLink()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
};
