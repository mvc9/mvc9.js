(function() {
    'use strict';
    window.$mvc = window.$mvc || { "name": "MVC9", "version": "1.0.0", "debug": false };
    if (!console.time) {
        var a = function() {};
        console.group = a;
        console.groupEnd = a;
        console.time = a;
        console.timeEnd = a;
    }

    /*	@description window.onload event
     *	@param {fn} Function
     */
    $mvc.onload = function(fn) {
        window.onload = function() {
            fn();
        }
    };

    /*=====  Map Node MVC  =====*/
    $mvc.regex = {};
    $mvc.regex.NodeMark = /\{{2}[^}}]+}{2}/g;
    $mvc.mapNode = {};
    /*	@description Generate a marked html dom into a mvcNodeModel.
     *	@param {node} HTMLCollection
     *	@return {Object} mvcNodeModel
     */
    $mvc.mapNode.model = function(node) {
        node = node || document.body;
        $mvc.mapNode.memoryNode = {
            "node": node,
            "sourceHTML": node.innerHTML,
            "nodeRepeats": [],
            "nodeMarks": [],
            "compileHTML": null
        }
        return $mvc.mapNode.memoryNode;
    };
    /*	@description Restore a compiled mvcNodeModel into marked html.
     *	@param {Object} mvcNodeModel
     *	@return {Object} mvcNodeModel
     */
    $mvc.mapNode.restore = function(nodeData) {
        nodeData.node.innerHTML = nodeData.sourceHTML;
        nodeData.nodeRepeats = [];
        nodeData.nodeMarks = [];
        nodeData.compileHTML = '';
        return nodeData;
    };
    /*	@description Compile a mvcNodeModel by reading window.* varable.
     *	@param {Object} mvcNodeModel
     *	@return {Object} mvcNodeModel
     */
    $mvc.mapNode.compile = function(nodeData) {
        nodeData = nodeData || $mvc.mapNode.memoryNode;
        $mvc.debug ? console.group('%c$mvc compile', 'color:#69f;') : null;
        $mvc.debug ? console.log('%cModel Element LocalName : ' + nodeData.node.localName, 'color:#D07E27') : null;
        $mvc.debug ? console.log('%cModel Element Id : ' + (nodeData.node['id'] || ''), 'color:#D07E27') : null;
        $mvc.debug ? console.log('%cModel Element Class : ' + (nodeData.node['className'] || ''), 'color:#D07E27') : null;
        $mvc.debug ? console.time('Elapsed Time') : null;
        nodeData.node.innerHTML = nodeData.sourceHTML;
        filtRepeatNode(nodeData);
        $mvc.debug ? console.timeEnd('Elapsed Time') : null;
        $mvc.debug ? console.groupEnd('%c$mvc compile', 'color:#69f;') : null;
        return $mvc.mapNode.memoryNode;
    };

    function filtRepeatNode(nodeData) {
        var tier = 0;
        $mvc.mapNode.memoryNode.nodeRepeats = [];
        mapChildFindRepeat(nodeData.node, tier);
        nodeData.compileHTML = nodeData.node.innerHTML;
        nodeData = filtNodeMarks(nodeData);
        compileNodeMarks(nodeData);
        $mvc.mapNode.memoryNode = nodeData;

        function mapChildFindRepeat(node, tier) {
            for (var i = 0; i < node.childNodes.length; i++) {
                if (node.childNodes[i].attributes) {
                    for (var n = 0; n < node.childNodes[i].attributes.length; n++) {
                        if (node.childNodes[i].attributes[n].nodeName) {
                            if (node.childNodes[i].attributes[n].nodeName == 'mvc-repeat') {
                                var tempRepeat = {
                                    "repeatMark": node.childNodes[i].attributes[n].nodeValue,
                                    "repeatTier": tier,
                                    "repeatNode": node.childNodes[i],
                                    "repeatHTML": node.childNodes[i].innerHTML
                                };
                                nodeData.nodeRepeats.push(tempRepeat);
                                var repeatTimes = 0;
                                var compileHTML = '';
                                if (eval('typeof(' + tempRepeat.repeatMark + ')') == 'object') {
                                    for (repeatTimes; repeatTimes < eval(tempRepeat.repeatMark + '.length'); repeatTimes++) {
                                        var tempHTML = tempRepeat.repeatHTML;
                                        while (tempHTML != tempHTML.replace('$' + tier, repeatTimes)) {
                                            tempHTML = tempHTML.replace('$' + tier, repeatTimes);
                                        }
                                        compileHTML = compileHTML + tempHTML;
                                    }
                                } else {
                                    $mvc.debug ? console.warn(tempRepeat.repeatMark + ' is not Array!') : null;
                                }
                                node.childNodes[i].innerHTML = compileHTML;
                                tier = tier + 1;
                            }
                        }
                    }
                    mapChildFindRepeat(node.childNodes[i], tier);
                }
            }
        }
    };

    function filtNodeMarks(nodeData) {
        nodeData.nodeMarks = nodeData.compileHTML.match($mvc.regex.NodeMark) || [];
        return nodeData;
    }

    function compileNodeMarks(nodeData) {
        var htmlStr = nodeData.compileHTML;
        var mapedMarks = nodeData.nodeMarks;
        var tempMark;
        for (var i = 0; i < mapedMarks.length; i++) {
            tempMark = mapedMarks[i].replace(/({{)/g, '');
            tempMark = tempMark.replace(/(}})/g, '');
            tempMark = tempMark.replace(/^(="")/g, '');
            if (eval('typeof(' + tempMark + ')') != 'undefined') {
                htmlStr = htmlStr.replace(mapedMarks[i], eval(tempMark));
            } else {
                htmlStr = htmlStr.replace(mapedMarks[i], '');
            }
        }
        nodeData.node.innerHTML = htmlStr;
    };


    /*=====  Single Ajax  =====*/
    $mvc.sAjaxSequence = [];
    /*	@description single AJAX request.
     *	@param {Object} param
     *	@return {Object} param
     *	@example
     *	var param={
     *		"name":'request1',
     *		"url":'www.mvc9.com/api/1',
     *		"method":'GET',
     *		"header":{"name":'mvc9', "value":'hello'},
     *		"async":true,
     *		"contentType":'application/json',
     *		"content":{"message":'Hello content!'},
     *		"crackCallback":function(name) {*your code*},
     *		"delay":100(ms){after request finished 100ms,unlock this requset.},
     *		"finishCallback":function(status, response) {*your code*}
     *	};
     *	$mvc.sAjax(param);
     */
    $mvc.sAjax = function(param) {
        param = {
            "name": param.name || 'null',
            "crackCallback": param.crackCallback || function(name) { console.warn('sAjax(name:' + name + ') is canceled because of an unfinished same sAjax!'); },
            "url": param.url || window.location.href,
            "method": param.method || 'GET',
            "header": param.header || [],
            "contentType": param.contentType || 'application/x-www-form-urlencoded',
            "content": param.content || '',
            "async": !!param.async || true,
            "delay": param.delay || 100,
            "finishCallback": param.finishCallback || function() {}
        }
        param.header.push({
            "name": 'Content-Type',
            "value": param.contentType
        });
        if (param.contentType.match(/application\/x-www-form-urlencoded/g)) {
            param.header.push({
                "name": 'X-Requested-With',
                "value": 'XMLHttpRequest'
            });
            if (typeof(param.content) == 'object') {
                var formStr = '';
                for (var key in param.content) {
                    if (formStr) {
                        formStr = formStr + '&' + encodeURIComponent(key) + '=' + encodeURIComponent(param.content[key]);
                    } else {
                        formStr = encodeURIComponent(key) + '=' + encodeURIComponent(param.content[key]);
                    }
                }
                param.content = formStr;
            }
        } else {
            if (JSON) {
                if (typeof(param.content) == 'object') {
                    param.content = JSON.stringify(param.content);
                }
            }
        }
        if (!param.name) {
            console.error('$mvc.sAjax param.name can not be omitted!');
            return;
        } else {
            for (var m = 0; m < $mvc.sAjaxSequence.length; m++) {
                if ($mvc.sAjaxSequence[m] == param.name) {
                    param.crackCallback(param.name);
                    return;
                }
            }
            $mvc.sAjaxSequence.push(param.name);
        }
        var xmlHttp = null;
        xmlHttp = GetXmlHttpObject();
        if (xmlHttp == null) {
            alert("Your brower dose not support AJAX!");
            return;
        }
        xmlHttp.onreadystatechange = stateChanged;
        xmlHttp.open(param.method, param.url, param.async);
        for (var n = 0; n < param.header.length; n++) {
            xmlHttp.setRequestHeader(param.header[n].name, param.header[n].value);
        }
        xmlHttp.send(param.content);
        return param;

        function stateChanged() {
            if (xmlHttp.readyState == 4) {
                for (var i = 0; i < $mvc.sAjaxSequence.length; i++) {
                    setTimeout(function() {
                        $mvc.sAjaxSequence = $mvc.sAjaxSequence.slice(0, (i - 1)).concat($mvc.sAjaxSequence.slice(i, ($mvc.sAjaxSequence.length - 1)));
                    }, param.delay);
                }
                param.finishCallback(xmlHttp.status, xmlHttp.responseText);
            }
        }

        function GetXmlHttpObject() {
            var xmlHttpFunction = null;
            try {
                // Webkit,Firefox,Opera8.0+,Safari
                xmlHttpFunction = new XMLHttpRequest();
            } catch (e) {
                // Internet Explorer
                try {
                    xmlHttpFunction = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    xmlHttpFunction = new ActiveXObject("Microsoft.XMLHTTP");
                }
            }
            return xmlHttpFunction;
        }
    }
})();
