module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      node: {
        files: {
          src: ['{bin/**/,config/**/,lib/**/,routes/**/,test/}*.js']
        },
        options: {
          curly: true,
          eqeqeq: true,
          eqnull: true,
          node: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
};
