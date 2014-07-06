module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      node: {
        files: {
          src: ['{bin/**/,config/**/,lib/**/,routes/**/,test/}*.js']
        },
        options: {
          jshintrc: '.jshintrc'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
};
