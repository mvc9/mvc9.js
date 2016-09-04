(function() {
    'use strict';

    $mvc.route = {};
    $mvc.route.srcPath = {};
    $mvc.route.srcPath.defaultHtmlPath = 'html';
    $mvc.route.srcPath.defaultStylePath = 'style';
    $mvc.route.srcPath.defaultScriptPath = 'script';

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
        console.log($mvc.route.srcPath);
    }
    window.addEventListener('hashchange', function(e, a) {
        e.preventDefault();
        mapPath(location.hash);
    });
    mapPath(location.hash);
})();
