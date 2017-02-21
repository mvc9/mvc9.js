(function() {
    'use strict';

    $mvc.route = {};
    $mvc.route.appVersion = String(Math.random()).split('.')[1];

    $mvc.route.resCurrent = [];
    $mvc.route.resMemory = [];
    $mvc.route.resNodeGlobal = document.createElement('res-global');
    $mvc.route.resNodeCurrent = document.createElement('res-current');

    $mvc.route.srcPath = {};
    $mvc.route.srcPath.htmlPath = 'html';
    $mvc.route.srcPath.stylePath = 'style';
    $mvc.route.srcPath.scriptPath = 'script';
    $mvc.route.srcPath.htmlSuffix = '.html';
    $mvc.route.srcPath.styleSuffix = '.css';
    $mvc.route.srcPath.scriptSuffix = '.js';

    function mapPath(hash) {
        $mvc.route.srcPath.path = '';
        $mvc.route.srcPath.file = 'index';
        var tempArray = hash.split('/');
        for (var i = 1; i < tempArray.length; i++) {
            if ((i + 1) == tempArray.length) {
                $mvc.route.srcPath.file = tempArray[i];
            } else {
                $mvc.route.srcPath.path = $mvc.route.srcPath.path + '/' + tempArray[i];
            }
        }
        // console.log($mvc.route.srcPath);
        $mvc.route.requireHTML('/' + $mvc.route.srcPath.htmlPath + $mvc.route.srcPath.path + '/' + $mvc.route.srcPath.file + $mvc.route.srcPath.htmlSuffix);
        $mvc.route.requireCSS('/' + $mvc.route.srcPath.stylePath + $mvc.route.srcPath.path + '/' + $mvc.route.srcPath.file + $mvc.route.srcPath.styleSuffix);
        $mvc.route.requireJS('/' + $mvc.route.srcPath.scriptPath + $mvc.route.srcPath.path + '/' + $mvc.route.srcPath.file + $mvc.route.srcPath.scriptSuffix);
    }

    window.addEventListener('hashchange', function(e, a) {
        e.preventDefault();
        mapPath(location.hash);
    });

    $mvc.route.requireHTML = function(url, element) {
        $mvc.console('log', 'load html:' + url);
        //do
    }

    $mvc.route.requireJS = function(url, isGlobal) {
        $mvc.console('log', 'load js:' + url);
        //do
    }

    $mvc.route.requireCSS = function(url, isGlobal) {
        $mvc.console('log', 'load css:' + url);
        //do
    }

    document.head.appendChild($mvc.route.resNodeGlobal);
    document.head.appendChild($mvc.route.resNodeCurrent);

    $mvc.onload(function() {
        $mvc.console('log', 'route start.');
        mapPath(location.hash);
    }, false);
})();
