(function(top) {
    'use strict';

    /* init $mvc object */
    var root = {};
    var $mvc = {
        "name": "mvc9.js(mvc9.com)",
        "version": "0.9.1 Beta",
        "logLevel": 0
    };
    $mvc.isNodeRuntime = !Boolean(top.location);
    $mvc.isNodeRuntime ? root = global : root = window;
    root.m = { "description": "Model Data Property" };
    root.v = { "description": "View Template Property" };
    root.c = { "description": "Control Property" };
    $mvc.root = root;

    /*  @description display console messages when $mvc.mode='dev';
     *  @param {String} command log,time,timeEnd,group,groupEnd
     *  @param {String} message log message or group name
     *  @param {String} color style color
     */
    $mvc.console = function(command, message, color, logLevel) {
        logLevel = logLevel || 1;
        if ($mvc.logLevel >= logLevel) {
            if (console.time) {
                switch (command) {
                    case 'time':
                        console.time(message);
                        break;
                    case 'timeEnd':
                        console.timeEnd(message);
                        break;
                    case 'group':
                        color = color || '#666';
                        console.group('%c' + message, 'color:' + color);
                        break;
                    case 'groupEnd':
                        console.groupEnd(message);
                        break;
                    case 'log':
                        color = color || '#111';
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

    /*=====  Single Ajax  =====*/
    $mvc.sAjaxSequence = [];
    /*  @description single AJAX request.
     *  @param {Object} param
     *  @return {Object} param
     *
     *  *** how to use $mvc.sAjax ***
     *
     *  var param = { * "name": 'request1',
     *      "url": 'www.mvc9.com/api/1',
     *      "method": 'GET',
     *      "header": { "framework": "mvc9" },
     *      "async": true,
     *      "contentType": 'application/json',
     *      "content": { "message": 'Hello content!' },
     *      "crackCallback": function(name) { * your code * },
     *      "delay": 100 // (ms) { after request finished 100 ms, unlock this requset. },
     *      "finishCallback": function(status, response) { * your code * } *
     *  }; 
     *  $mvc.sAjax(param);
     */

    $mvc.sAjax = function(param) {
        param = {
            "name": param.name || 'null',
            "crackCallback": param.crackCallback || function(name) { console.warn('sAjax(name:' + name + ') is canceled because of an unfinished same sAjax!'); },
            "url": param.url || window.location.href,
            "method": param.method || 'GET',
            "header": param.header || {},
            "contentType": param.contentType || 'application/x-www-form-urlencoded',
            "content": param.content || '',
            "async": !!param.async || true,
            "delay": param.delay || 100,
            "finishCallback": param.finishCallback || function() {}
        }
        param.header['Content-Type'] = param.contentType;
        if (param.contentType.match(/application\/x-www-form-urlencoded/g)) {
            param.header.push({
                "X-Requested-With": "XMLHttpRequest"
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
        for (var key in param.header) {
            xmlHttp.setRequestHeader(key, param.header[key]);
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

    /*  @description window.onload event
     *  @param {Function} fn
     */
    $mvc.onload = function(fn, doCompile) {
        doCompile == doCompile || false;

        function afterLoadFn() {
            fn();
            if (doCompile) {
                $mvc.mapNode.autoMold();
                for (var key in $mvc.mapNode.Molds) {
                    compile(key, $mvc.mapNode.Molds[key]);
                }
            }
        }

        if (window.addEventListener) {
            window.addEventListener('load', function(e) {
                afterLoadFn();
            });
        } else {
            window.attachEvent('onload', function(e) {
                afterLoadFn();
            });
        }
    };

    /*=====  Map Node MVC  =====*/
    $mvc.regex = {};
    $mvc.regex.NodeMark = new RegExp('{{2,3}[^{}]*}{2,3}', 'g');
    $mvc.mapNode = {};
    $mvc.mapNode.Molds = {};

    $mvc.mapNode.getElementsByAttributeName = function(node, AttributeName) {
        node = node || document;
        var allNodes = node.getElementsByTagName('*');
        var matchNodes = [];
        for (var i = 0; i < allNodes.length; i++) {
            //if this child is not a text
            if (allNodes[i].attributes) {
                for (var n = 0; n < allNodes[i].attributes.length; n++) {
                    //if this attribute has object.nodeName
                    if (allNodes[i].attributes[n].nodeName) {
                        //if current node's current attribute is 'mvc-template'
                        if (allNodes[i].attributes[n].nodeName == AttributeName) {
                            matchNodes.push(allNodes[i]);
                        }
                    }
                }
            }
        }
        return matchNodes;
    }

    /*  @decscription auto make mvc-template into a mold;
     *    Caution:this function will clear all mold you have make!
     */
    $mvc.mapNode.autoMold = function(node) {
        $mvc.mapNode.Molds = [];
        var mvcTemplateNodes = $mvc.mapNode.getElementsByAttributeName(node, 'mvc-template');
        for (var n = 0; n < mvcTemplateNodes.length; n++) {
            $mvc.mapNode.Mold(mvcTemplateNodes[n].attributes['mvc-template']['value'], mvcTemplateNodes[n]);
        }
    }

    /*  @description Generate a marked html dom into a mvcNodeMold.
     *  @param {Node} HTMLCollection
     *  @return {Object} mvcNodeMold
     */
    $mvc.mapNode.Mold = function(name, node, beforeCompile, afterCompile) {
        var memoryNode;
        if (name) {
            node = node || document.body;
            memoryNode = {
                "node": node,
                "nodeMarks": [],
                "nodeRepeats": [],
                "sourceHTML": node.innerHTML,
                "beforeCompile": beforeCompile,
                "afterCompile": afterCompile
            }
            $mvc.mapNode.Molds[name] = memoryNode;
        }
    };

    /*  @description Restore a compiled mvcNodeMold into marked html.
     *  @param {Object} mvcNodeMold
     *  @return {Object} mvcNodeMold
     */
    $mvc.mapNode.restore = function(templateName) {
        restore($mvc.mapNode.Molds[templateName]);
    }

    function restore(nodeData) {
        nodeData.nodeMarks = [];
        nodeData.nodeRepeats = [];
        nodeData.node.innerHTML = nodeData.sourceHTML;
        return nodeData;
    };

    /*  @description Compile a mvcNodeMold by reading window.* varable.
     *  @param {Object} mvcNodeMold
     *  @return {Object} mvcNodeMold
     */
    $mvc.mapNode.compile = function(templateName) {
        if ($mvc.mapNode.Molds[templateName]) {
            $mvc.mapNode.Molds[templateName].beforeCompile ? $mvc.mapNode.Molds[templateName].beforeCompile() : null;
            var compiledNode = compile(templateName, $mvc.mapNode.Molds[templateName]);
            $mvc.mapNode.Molds[templateName].afterCompile ? $mvc.mapNode.Molds[templateName].afterCompile() : null;
            return compiledNode;
        } else {
            console.warn('cannot find template mold by templateName "' + templateName + '"');
            return {};
        }
    }

    function compile(name, nodeData) {
        $mvc.console('group', '$mvc compile', 5);
        $mvc.console('log', 'Template Name : ' + name, '#33f', 5);
        $mvc.console('log', 'Template Element TagName : ' + nodeData.node.localName, '#69f', 5);
        nodeData.node.id ? $mvc.console('log', 'Template Element Id : ' + nodeData.node.id, '#69f', 5) : null;
        nodeData.node.className ? $mvc.console('log', 'Template Element Class : ' + nodeData.node.className, '#69f', 5) : null;
        $mvc.console('time', 'Elapsed Time');
        $mvc.mapNode.restore(name, nodeData);
        nodeData = filtRepeatNode(nodeData);
        nodeData = filtNodeMarks(nodeData);
        nodeData = compileNodeMarks(nodeData);
        $mvc.console('log', 'Template Repeats : ' + nodeData.nodeRepeats.length, '#69f', 5);
        $mvc.console('log', 'Template Marks : ' + nodeData.nodeMarks.length, '#69f', 5);
        $mvc.console('timeEnd', 'Elapsed Time', 5);
        $mvc.console('groupEnd', '$mvc compile', 5);
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
                                    $mvc.console('warn', tempRepeat.repeatMark + ' is not Array!', null, 1);
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
        var mark3LRegex = new RegExp('{{{');
        var mark3RRegex = new RegExp('}}}');
        var markFixRegex = [new RegExp('{', 'g'), new RegExp('}', 'g'), new RegExp('<', 'g'), new RegExp('>', 'g'), new RegExp('}}=""', 'g'), new RegExp('\"', 'g'),];
        var tempMark;
        var tempStr;
        var isTrueElement;
        for (var i = 0; i < mapedMarks.length; i++) {
            isTrueElement = mark3LRegex.test(mapedMarks[i]) && mark3RRegex.test(mapedMarks[i]);
            htmlStr = htmlStr.replace(markFixRegex[4], '}}');
            tempMark = mapedMarks[i].replace(markFixRegex[0], '');
            tempMark = tempMark.replace(markFixRegex[1], '');
            if (eval('typeof(' + tempMark + ')') != 'undefined') {
                tempStr = String(eval(tempMark));
                isTrueElement ? null : tempStr = tempStr.replace(markFixRegex[2], '&#60;');
                isTrueElement ? null : tempStr = tempStr.replace(markFixRegex[3], '&#62;');
                htmlStr = htmlStr.replace(mapedMarks[i], tempStr);
            } else {
                htmlStr = htmlStr.replace(mapedMarks[i], '');
            }
        }
        if (nodeData.node.innerHTML !== htmlStr) {
            nodeData.node.innerHTML = htmlStr;
        }
        return nodeData;
    };

    root.$mvc = $mvc;
})(this);
