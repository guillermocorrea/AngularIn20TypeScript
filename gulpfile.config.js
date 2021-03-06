'use strict';
var GulpConfig = (function () {
    function gulpConfig() {
        //Got tired of scrolling through all the comments so removed them
        //Don't hurt me AC :-)
        this.source = './src/';
        this.sourceApp = this.source + 'app/';

        this.tsOutputPath = this.source + '/js';
        this.allJavaScript = [this.source + '/js/**/*.js'];
        this.allTypeScript = this.sourceApp + '/**/*.ts';

        this.allStyles =  this.source + 'styles/**/*.css';
        
        this.allSources = [this.allJavaScript[0], this.allStyles];
        
        this.libScripts = [this.source + 'lib/**/*.js'];
        this.libStyles = [this.source + 'lib/**/*.css'];
        
        this.distFolder = './dist/';
        
        this.typings = './tools/typings/';
        this.libraryTypeScriptDefinitions = './tools/typings/**/*.ts';
    }
    return gulpConfig;
})();
module.exports = GulpConfig;
