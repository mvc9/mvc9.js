(function() {
    'use strict';
    /* init $mvc object */
    window.$mvc = window.$mvc || { "name": "MVC9", "version": "1.0.1", "mode": 'dev' };
    /*  @description display console messages when mode=dev;
     *  @param {String} command log,time,timeEnd,group,groupEnd
     *  @param {String} message log message or group name
     *  @param {String} color style color
     */
    $mvc.console = function(command, message, color) {
        if ($mvc.mode == 'dev') {
            if (console.time) {
                switch (command) {
                    case 'time':
                        console.time(message);
                        break;
                    case 'timeEnd':
                        console.timeEnd(message);
                        break;
                    case 'group':
                        color = color || '#000';
                        console.group('%c' + message, 'color:' + color);
                        break;
                    case 'groupEnd':
                        console.groupEnd(message);
                        break;
                    case 'log':
                        color = color || '#555';
                        console.log('%c' + message, 'color:' + color);
                        break;
                    case 'warn':
                        color = color || 'f96';
                        console.warn('%c' + message, 'color' + color);
                        break;
                }
            } else {
                switch (command) {
                    case 'log':
                        console.log(message);
                        break;
                    case 'warn':
                        console.warn(message);
                        break;
                    case 'error':
                        console.error(message);
                        break;
                }
            }
        }
    }

    /*  @description window.onload event
     *  @param {Function} fn
     */
    $mvc.onload = function(fn) {
        window.onload = function() {
            fn();
        }
    };

    /*=====  Map Node MVC  =====*/
    $mvc.regex = {};
    $mvc.regex.NodeMark = new RegExp('{{[^(}})]*}}', 'g');
    $mvc.mapNode = {};
    /*  @description Generate a marked html dom into a mvcNodeModel.
     *  @param {Node} HTMLCollection
     *  @return {Object} mvcNodeModel
     */
    $mvc.mapNode.model = function(node) {
        node = node || document.body;
        $mvc.mapNode.memoryNode = {
            "node": node,
            "nodeMarks": [],
            "nodeRepeats": [],
            "sourceHTML": node.innerHTML
        }
        return $mvc.mapNode.memoryNode;
    };
    /*  @description Restore a compiled mvcNodeModel into marked html.
     *  @param {Object} mvcNodeModel
     *  @return {Object} mvcNodeModel
     */
    $mvc.mapNode.restore = function(nodeData) {
        nodeData.nodeMarks = [];
        nodeData.nodeRepeats = [];
        nodeData.node.innerHTML = nodeData.sourceHTML;
        return nodeData;
    };
    /*  @description Compile a mvcNodeModel by reading window.* varable.
     *  @param {Object} mvcNodeModel
     *  @return {Object} mvcNodeModel
     */
    $mvc.mapNode.compile = function(nodeData) {
        nodeData = nodeData || $mvc.mapNode.memoryNode;
        $mvc.console('group', '$mvc compile');
        $mvc.console('log', 'Model Element LocalName : ' + nodeData.node.localName);
        nodeData.node.id ? $mvc.console('log', 'Model Element Id : ' + nodeData.node.id) : null;
        nodeData.node.className ? $mvc.console('log', 'Model Element Class : ' + nodeData.node.className) : null;
        $mvc.console('time', 'Elapsed Time');
        $mvc.mapNode.restore(nodeData);
        nodeData = filtRepeatNode(nodeData);
        nodeData = filtNodeMarks(nodeData);
        nodeData = compileNodeMarks(nodeData);
        $mvc.mapNode.memoryNode = nodeData;
        $mvc.console('timeEnd', 'Elapsed Time');
        $mvc.console('groupEnd', '$mvc compile');
        return nodeData;
    };

    function filtRepeatNode(nodeData) {
        mapChildFindRepeat(nodeData.node, 0);

        function mapChildFindRepeat(node, tier) {
            //map current node child
            for (var i = 0; i < node.childNodes.length; i++) {
                //if this child is not a text
                if (node.childNodes[i].attributes) {
                    //map current child attribute
                    for (var n = 0; n < node.childNodes[i].attributes.length; n++) {
                        //if this attribute has object.nodeName
                        if (node.childNodes[i].attributes[n].nodeName) {
                            //if current node's current attribute is 'mvc-repeat'
                            if (node.childNodes[i].attributes[n].nodeName == 'mvc-repeat') {
                                var tierRegExp = new RegExp('\\$' + tier, 'g');
                                var tempRepeat = {
                                    "repeatMark": node.childNodes[i].attributes[n].nodeValue,
                                    "repeatHTML": node.childNodes[i].innerHTML,
                                    "repeatTier": tier
                                };
                                nodeData.nodeRepeats.push(tempRepeat);
                                var repeatTimes = 0;
                                var compileHTML = '';
                                if (eval('typeof(' + tempRepeat.repeatMark + ')') == 'object') {
                                    for (repeatTimes; repeatTimes < eval(tempRepeat.repeatMark + '.length'); repeatTimes++) {
                                        var tempHTML = tempRepeat.repeatHTML;
                                        tempHTML = tempHTML.replace(tierRegExp, repeatTimes);
                                        compileHTML = compileHTML + tempHTML;
                                    }
                                } else {
                                    $mvc.debug ? console.warn(tempRepeat.repeatMark + ' is not Array!') : null;
                                }
                                node.childNodes[i].innerHTML = compileHTML;
                                mapChildFindRepeat(node.childNodes[i], tier + 1);
                                break;
                            }
                        }
                    }
                    if (n == node.childNodes[i].attributes.length) {
                        mapChildFindRepeat(node.childNodes[i], tier);
                    }
                }
            }
        }
        return nodeData;
    };

    function filtNodeMarks(nodeData) {
        nodeData.nodeMarks = nodeData.node.innerHTML.match($mvc.regex.NodeMark) || [];
        return nodeData;
    }

    function compileNodeMarks(nodeData) {
        var htmlStr = nodeData.node.innerHTML;
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
        return nodeData;
    };


    /*=====  Single Ajax  =====*/
    $mvc.sAjaxSequence = [];
    /*  @description single AJAX request.
     *  @param {Object} param
     *  @return {Object} param
     *  @example
     *  var param={
     *      "name":'request1',
     *      "url":'www.mvc9.com/api/1',
     *      "method":'GET',
     *      "header":{"name":'mvc9', "value":'hello'},
     *      "async":true,
     *      "contentType":'application/json',
     *      "content":{"message":'Hello content!'},
     *      "crackCallback":function(name) {*your code*},
     *      "delay":100(ms){after request finished 100ms,unlock this requset.},
     *      "finishCallback":function(status, response) {*your code*}
     *  };
     *  $mvc.sAjax(param);
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
