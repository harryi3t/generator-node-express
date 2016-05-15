'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

var NodeExpressGenerator = module.exports = function NodeExpressGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({
      skipInstall: options['skip-install']
    });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(NodeExpressGenerator, yeoman.generators.Base);

NodeExpressGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var prompts = [
    {
      name: 'projectName',
      message: 'What would you like to call your project?'
    }, {
      name: 'heroku',
      type: 'confirm',
      message: 'Will you be deploying to Heroku?',
      default: false
    }
  ];

  this.prompt(prompts, function (answers) {
    this.projectName = answers.projectName;
    this.heroku = answers.heroku;
    cb();
  }.bind(this));
};

NodeExpressGenerator.prototype.gruntfile = function gruntfile() {
  this.copy('Gruntfile.js', 'Gruntfile.js');
};

NodeExpressGenerator.prototype.packageJSON = function packageJSON() {
  this.copy('_package.json', 'package.json');
};

NodeExpressGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
};

NodeExpressGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

NodeExpressGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

NodeExpressGenerator.prototype.api = function api() {
  this.mkdir('api');
  this.copy('api/employee/Model.js', 'api/employee/Model.js');
  this.copy('api/employee/Route.js', 'api/employee/Route.js');
  this.copy('api/employee/getS.js', 'api/employee/getS.js');
  this.copy('api/employee/post.js', 'api/employee/post.js');

};

NodeExpressGenerator.prototype.assets = function assets() {
  this.mkdir('static');
  this.mkdir('static/font');
  this.mkdir('static/images');
  this.mkdir('static/scripts');
  this.mkdir('static/styles');
  this.copy('favicon.ico', 'static/favicon.ico');
};

NodeExpressGenerator.prototype.app = function app() {
  this.copy('app.js', 'app.js');
};

NodeExpressGenerator.prototype.procfile = function procfile() {
  if (this.heroku) {
    this.copy('Procfile', 'Procfile');
  }
};

NodeExpressGenerator.prototype.readme = function readme() {
  this.copy('README.md', 'README.md');
};