'use strict';
//var util = require('util');
var path = require('path');
var yosay = require('yosay');
var Class = require('../class');

var AppGenerator = Class.extend({
    constructor: function() {
        Class.apply(this, arguments);
        this.createOptions();

        this.option('check-travis', {
            desc: 'Check if travis cli is installed',
            type: 'Boolean',
            defaults: true
        });

        this.argument('appname', {
            type: String,
            required: false
        });
        this.option('mobile', {
            desc: 'Indicates that the app is a mobile app',
            type: 'Boolean',
            defaults: false
        });

        this.appname = this.appname || path.basename(process.cwd());
        this.appname = this.camelize(this.appname);

    },

    initializing: function() {

        this.pkg = require('../package.json');
        this.notifyUpdate(this.pkg);

        var done = this.async();

        this.checkPython().then(function() {
            done();
        });

        //this.checkTravis().then(function() {
        //    done();
        //});

    },

    prompting: {
        welcome: function() {
            // Have Yeoman greet the user.
            if(!this.options['skip-welcome-message']) {
                this.log(yosay('Welcome to the amazing angular-famous-ionic generator!'));
            }

            this.composeWith('sublime:app', {
                options: {
                    'skip-welcome-message': true
                }
            });

        },
        askFor: function() {
            var done = this.async();

            var prompts = [{
                name: 'filenameCase',
                type: 'list',
                message: 'Would you like to use camelCase or snake-case for your filenames?',
                choices: [{
                    name: 'camelCase',
                    value: 'camel'
                }, {
                    name: 'snake-case',
                    value: 'snake'
                }],
                default: 'camel'
            }, {
                name: 'clientFolder',
                message: 'How would you like to name the client folder?',
                default: 'client'
            }, {
                name: 'ionic',
                type: 'confirm',
                message: 'Would you like to include ionic framework?',
                default: true
            }, {
                name: 'famous',
                type: 'confirm',
                message: 'Would you like to include famous-angular?',
                default: true
            }, {
                name: 'ngCordova',
                type: 'confirm',
                message: 'Would you like to include ngCordova?',
                default: true
            }, {
                name: 'material',
                type: 'confirm',
                message: 'Would you like to include angular-material?',
                default: true
            }, {
                name: 'fontawesome',
                type: 'confirm',
                message: 'Would you like to include font-awesome?',
                default: false
            }, {
                name: 'bootstrap',
                type: 'confirm',
                message: 'Would you like to include bootstrap?',
                default: false
            }];

            this.prompt(prompts, function(answers) {
                this.filenameCase = answers.filenameCase;
                this.clientFolder = answers.clientFolder;
                this.bootstrap = answers.bootstrap;
                this.ionic = answers.ionic;
                this.famous = answers.famous;
                this.ngCordova = answers.ngCordova;
                this.fontawesome = answers.fontawesome;
                this.material = answers.material;
                this.bootstrap = answers.bootstrap;
                this.mobile = this.options.mobile;

                this.composeWith('sublime:gulps', {
                    options: {
                        clientFolder: answers.clientFolder,
                        ionic: answers.ionic,
                        famous: answers.famous,
                        fontawesome: answers.fontawesome,
                        bootstrap: answers.bootstrap,
                        material: answers.material,
                        lint: true,
                        serve: true,
                        browserify: true,
                        release: true,
                        changelog: true,
                        test: true,
                        style: true,
                        dist: true
                            // pass answers.material
                    }
                });
                done();
            }.bind(this));

        }

        //         _askForModules: function() {
        //             var done = this.async();

        //             var choicesModules = [{
        //                 value: 'animateModule',
        //                 name: 'angular-animate.js',
        //                 checked: true
        //             }, {
        //                 value: 'cookiesModule',
        //                 name: 'angular-cookies.js',
        //                 checked: false
        //             }, {
        //                 value: 'resourceModule',
        //                 name: 'angular-resource.js',
        //                 checked: false
        //             }, {
        //                 value: 'sanitizeModule',
        //                 name: 'angular-sanitize.js',
        //                 checked: true
        //             }];
        //             var prompts = [{
        //                 type: 'checkbox',
        //                 name: 'modules',
        //                 message: 'Which modules would you like to include?',
        //                 choices: choicesModules
        //             }];

        //             this.prompt(prompts, function(answers) {
        //                 // transform the choices into boolean properties on 'this' : this.sanitizeModule
        //                 this.choicesToProperties(answers, choicesModules, 'modules');

        //                 done();
        //             }.bind(this));
        //         }
    },

    configuring: function() {
        this.config.set('filenameCase', this.filenameCase);
        this.config.set('appname', this.appname);
        this.config.set('clientFolder', this.clientFolder);
        this.config.set('ionic', this.ionic);
        this.config.set('famous', this.famous);
        this.config.set('ngCordova', this.ngCordova);
        this.config.set('fontawesome', this.fontawesome);
        this.config.set('bootstrap', this.bootstrap);
        this.config.set('material', this.material);
        this.config.forceSave();
    },

    writing: {

        setRoot: function() {
            this.suffix = '';
            this.sourceRoot(path.join(__dirname, '../templates/app'));
        },

        projectfiles: function() {
            this.template('_package.json', 'package.json');
            this.template('_bower.json', 'bower.json');
            this.template('_bowerrc', '.bowerrc');
            this.template('karma.conf.js');
            this.template('protractor.conf.js');
            this.template('bin/prepublish.sh');
            this.template('bin/protractor-fix-version.js');
            this.template('bin/cordova-generate-icons');
            this.template('bin/cordova-generate-splashes');
        },

        clientfiles: function() {
            this.targetDir = path.join(process.cwd(), this.clientFolder);
            this.mkdir(this.clientFolder);
            this.mkdir(this.clientFolder + '/styles');
            this.mkdir(this.clientFolder + '/scripts');
            this.mkdir(this.clientFolder + '/images/app');
            this.mkdir(this.clientFolder + '/icons/app');
            this.mkdir(this.clientFolder + '/fonts/app');
            this.template('client/_eslintrc', this.clientFolder + '/.eslintrc');
            this.template('../target/index.html', this.clientFolder + '/index.html');
            this.template('client/404.html', this.clientFolder + '/404.html');
            this.template('client/robots.txt', this.clientFolder + '/robots.txt');
            this.template('client/favicon.ico', this.clientFolder + '/favicon.ico');
            this.template('../target/styles/main.scss', this.clientFolder + '/styles/main.scss');
            this.template('../target/scripts/main.js', this.clientFolder + '/scripts/main.js');
            this.template('../target/scripts/main.test.js', this.clientFolder + '/scripts/main.test.js');
            if(this.mobile) {
                this.template('../target/config.xml', path.join(this.targetDir, 'config' + '.xml'));
                this.directory('../target/hooks', path.join(this.targetDir, 'cordova', 'app', 'hooks'));
            }
        },

        testFiles: function() {
            this.mkdir('test');
            this.mkdir('test/unit');
            this.mkdir('test/mocha');
            this.mkdir('test/mocha/helpers');
            this.mkdir('test/e2e');
            this.template('test/e2e/e2e.test.js');
            this.template('test/e2e/_eslintrc', 'test/e2e/.eslintrc');
            this.template('test/mocha/helpers/globals.js', 'test/mocha/helpers/globals.js');
            this.template('test/unit/polyfill.js', 'test/unit/polyfill.js');
            this.template('test/unit/unitHelper.js', 'test/unit/unitHelper.js');

        },

        serverfiles: function() {
            this.mkdir('server');
        }
    },

    install: function() {

    },

    end: function() {
        this.installDependencies({
            skipInstall: this.options['skip-install'],
            skipMessage: this.options['skip-message']
        });
    }
});

module.exports = AppGenerator;
