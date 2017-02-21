(function() {
    'use strict';

    $mvc.route = {};
    $mvc.route.appIdentifer = 'App-' + String((new Date()).getTime());

    $mvc.route.resCurrent = [];
    $mvc.route.resMemory = [];
    $mvc.route.resNodeGlobal = document.createElement('res-global');
    $mvc.route.resNodeCurrent = document.createElement('res-current');

    $mvc.route.srcPath = {};
    $mvc.route.srcPath.htmlSuffix = '.html';
    $mvc.route.srcPath.styleSuffix = '.css';
    $mvc.route.srcPath.scriptSuffix = '.js';

    function mapPath(hash) {
        $mvc.route.srcPath.path = '';
        $mvc.route.srcPath.file = 'main';
        var tempArray = hash.split('/');
        for (var i = 1; i < tempArray.length; i++) {
            if ((i + 1) == tempArray.length) {
                $mvc.route.srcPath.file = tempArray[i];
            } else {
                $mvc.route.srcPath.path = $mvc.route.srcPath.path + '/' + tempArray[i];
            }
        }
        $mvc.route.requireHTML('/' + $mvc.route.srcPath.path + '/' + $mvc.route.srcPath.file + $mvc.route.srcPath.htmlSuffix, false, document.body);
    }

    window.addEventListener('hashchange', function(e, a) {
        e.preventDefault();
        mapPath(location.hash);
    });

    $mvc.route.requireHTML = function(url, isGlobal, element) {
        $mvc.console('log', 'load html:' + url);
        $mvc.route.resCurrent.push({
            "url": url,
            "type": 'html',
            "global": isGlobal,
            "target": element,
            "progress": 1, //progress=0[on queue],progress=1[on request],progress=2[success],progress=3[failed],progress=4[finished];
            "content": null
        });
        requestRes($mvc.route.resCurrent.length - 1);
    }

    $mvc.route.requireCSS = function(url, isGlobal) {
        $mvc.console('log', 'load css:' + url);
        $mvc.route.resCurrent.push({
            "url": url,
            "type": 'style',
            "global": isGlobal,
            "target": null,
            "progress": 1,
            "content": null
        });
        requestRes($mvc.route.resCurrent.length - 1);
    }

    $mvc.route.requireJS = function(url, isGlobal) {
        $mvc.console('log', 'load js:' + url);
        $mvc.route.resCurrent.push({
            "url": url,
            "type": 'script',
            "global": isGlobal,
            "target": null,
            "progress": 1,
            "content": null
        });
        requestRes($mvc.route.resCurrent.length - 1);
    }

    function requestRes(resIndex) {
        var request = {
            "name": $mvc.route.resCurrent[resIndex].url,
            "url": $mvc.route.resCurrent[resIndex].url,
            "contentType": 'application/ajax',
            "finishCallback": function(status, response) {
                if (status) {
                    $mvc.route.resCurrent[resIndex].content = response;
                    $mvc.route.resCurrent[resIndex].progress = 2;
                } else {
                    $mvc.route.resCurrent[resIndex].progress = 3;
                }
                maintainResCurrent();
            }
        };
        $mvc.sAjax(request);
    }

    function maintainResCurrent() {
        var htmlRes = [];
        var styleRes = [];
        var scriptRes = [];
        for (var n = 0; n < $mvc.route.resCurrent.length; n++) {
            if ($mvc.route.resCurrent[n].progress == 1) {
                return;
            } else if ($mvc.route.resCurrent[n].type == 'html' && $mvc.route.resCurrent[n].progress == 2) {
                htmlRes.push($mvc.route.resCurrent[n]);
            } else if ($mvc.route.resCurrent[n].type == 'style' && $mvc.route.resCurrent[n].progress == 2) {
                styleRes.push($mvc.route.resCurrent[n]);
            } else if ($mvc.route.resCurrent[n].type == 'script' && $mvc.route.resCurrent[n].progress == 2) {
                scriptRes.push($mvc.route.resCurrent[n]);
            }
        }
        console.log(htmlRes, styleRes, scriptRes);
        for (var n = 0; n < styleRes.length; n++) {
            (function() {
                var tempStyleElement = document.createElement('style');
                tempStyleElement.title = styleRes[n].url;
                tempStyleElement.innerHTML = styleRes[n].content;
                if (styleRes[n].global) {;
                }
            })();
        }
    }

    document.head.appendChild($mvc.route.resNodeGlobal);
    document.head.appendChild($mvc.route.resNodeCurrent);

    $mvc.onload(function() {
        $mvc.console('log', 'route start.');
        mapPath(location.hash);
    }, false);
})();
