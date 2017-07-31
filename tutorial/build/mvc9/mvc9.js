(function (top) {
  'use strict';

  /* init $mvc object */
  var root = {};
  var $mvc = {
    "name": "mvc9.js(mvc9.com)",
    "version": "1.2.0",
    "logLevel": 0
  };
  $mvc.isNodeRuntime = !Boolean(top.location);
  $mvc.isNodeRuntime ? root = global : root = window;
  root.m = { "description": "Model Data Property" };
  root.v = { "description": "View renderScope Property" };
  root.c = { "description": "Control Property" };
  $mvc.root = root;

  /*  @description display console messages when $mvc.mode='dev';
   *  @param {String} command log,time,timeEnd,group,groupEnd
   *  @param {String} message log message or group name
   *  @param {String} color style color
   */
  $mvc.console = function (command, message, color, logLevel) {
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

  /*=====  example httpCom(AJAX)  =====*/
  $mvc.httpComSequence = [];
  /*  @description single AJAX request.
   *  @param {Object} param
   *  @return {Object} param
   *
   *  *** how to use $mvc.httpCom ***
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
   *  $mvc.httpCom(param);
   */

  $mvc.httpCom = function (param) {
    param = {
      "name": param.name || 'null',
      "crackCallback": param.crackCallback || function (name) { console.warn('httpCom(name:' + name + ') is canceled because of an unfinished httpCom request with same name!'); },
      "url": param.url || window.location.href,
      "method": param.method || 'GET',
      "header": param.header || {},
      "contentType": param.contentType || 'application/x-www-form-urlencoded',
      "content": param.content || '',
      "async": !!param.async || true,
      "delay": param.delay || 100,
      "finishCallback": param.finishCallback || function () {}
    }
    param.header['Content-Type'] = param.contentType;
    if (param.contentType.match(/application\/x-www-form-urlencoded/g)) {
      param.header.push({
        "X-Requested-With": "XMLHttpRequest"
      });
      if (typeof (param.content) == 'object') {
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
        if (typeof (param.content) == 'object') {
          param.content = JSON.stringify(param.content);
        }
      }
    }
    if (!param.name) {
      console.error('$mvc.httpCom param.name can not be omitted!');
      return;
    } else {
      for (var m = 0; m < $mvc.httpComSequence.length; m++) {
        if ($mvc.httpComSequence[m] == param.name) {
          param.crackCallback(param.name);
          return;
        }
      }
      $mvc.httpComSequence.push(param.name);
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
        for (var i = 0; i < $mvc.httpComSequence.length; i++) {
          setTimeout(function () {
            $mvc.httpComSequence = $mvc.httpComSequence.slice(0, (i - 1)).concat($mvc.httpComSequence.slice(i, ($mvc.httpComSequence.length - 1)));
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
  $mvc.onload = function (fn, doCompile) {
    doCompile == doCompile || false;

    function afterLoadFn() {
      fn();
      if (doCompile) {
        $mvc.mapNode.mapRenderToMold(document);
        $mvc.mapNode.renderScopePath();
        $mvc.mapNode.molds = [];
        $mvc.mapNode.mapRenderToMold(document);
        for (var n = 0; n < $mvc.mapNode.molds.length; n++) {
          compile($mvc.mapNode.molds[n].path, $mvc.mapNode.molds[n]);
        }
      }
    }

    if (window.addEventListener) {
      window.addEventListener('load', function (e) {
        afterLoadFn();
      });
    } else {
      window.attachEvent('onload', function (e) {
        afterLoadFn();
      });
    }
  };

  /*=====  Map Node MVC  =====*/
  $mvc.regex = {};
  $mvc.regex.nodeMark = new RegExp('{{2,3}[^{}]*}{2,3}', 'g');
  $mvc.regex.HTMLMark = new RegExp('<html>(.*\s)*</html>');
  $mvc.regex.scopePathMark = new RegExp('\\$path', 'g');
  $mvc.mapNode = {};
  $mvc.mapNode.molds = [];

  $mvc.mapNode.mapNodeByAttributeName = function (node, attributeName, path, matchTask) {
    //map current node child
    for (var i = 0; i < node.childNodes.length; i++) {
      //if this child is not a text
      if (node.childNodes[i].attributes) {
        //map current child attribute
        for (var n = 0; n < node.childNodes[i].attributes.length; n++) {
          //if this attribute has object.nodeName
          if (node.childNodes[i].attributes[n].nodeName) {
            //if current node's current attribute is 'attributeName'
            if (node.childNodes[i].attributes[n].nodeName === attributeName) {
              matchTask(node.childNodes[i], node.childNodes[i].attributes[n].nodeValue, path);
              break;
            }
          }
        }
        if (n === node.childNodes[i].attributes.length) {
          $mvc.mapNode.mapNodeByAttributeName(node.childNodes[i], attributeName, path, matchTask);
        }
      }
    }
    return node;
  }

  $mvc.mapNode.getElementsByAttributeName = function (node, attributeName, attributeValue) {
    var matchNodes = [];
    var matchTask = function (node, value) {
      if (attributeValue) {
        if (value === attributeValue) {
          matchNodes.push(node);
        }
      } else {
        matchNodes.push(node);
      }
      $mvc.mapNode.mapNodeByAttributeName(node, attributeName, null, matchTask);
    }
    $mvc.mapNode.mapNodeByAttributeName(node, attributeName, null, matchTask);
    return matchNodes;
  }

  $mvc.mapNode.mapIncludes = function (node, readResSync, pathPrefix) {
    var matchTask = function (node, includePath, path) {
      var includeHTML = readResSync(pathPrefix + includePath);
      if (includeHTML !== false) {
        node.innerHTML = includeHTML;
        $mvc.mapNode.mapNodeByAttributeName(node, 'x-include', null, matchTask);
      }
    };
    $mvc.mapNode.mapNodeByAttributeName(node, 'x-include', null, matchTask);
  }

  $mvc.mapNode.mapRenderToMold = function (node) {
    var matchTask = function (node, includePath, path) {
      var renderScopeName = node.attributes['x-render']['value'];
      var scopePath = path.join('"').match(/[^\"]+/g) || [];
      scopePath.push(renderScopeName);
      node.setAttribute('x-path', scopePath.join('.'));
      $mvc.mapNode.mold(renderScopeName, node, scopePath);
      $mvc.mapNode.mapNodeByAttributeName(node, 'x-render', scopePath, matchTask);
    }
    $mvc.mapNode.mapNodeByAttributeName(node, 'x-render', [], matchTask);
  }

  $mvc.mapNode.renderScopePath = function () {
    for (var n = $mvc.mapNode.molds.length; n > 0; n--) {
      var mold = $mvc.mapNode.molds[n - 1];
      mold.node.innerHTML = mold.node.innerHTML.replace($mvc.regex.scopePathMark, mold.path.join("']['"))
    }
  }

  /*  @decscription auto make x-render into a mold;
   *    Caution:this function will clear all mold you have make!
   */
  $mvc.mapNode.autoMold = function () {
    var mvcrenderScopeNodes = $mvc.mapNode.getElementsByAttributeName(document, 'x-render');
    for (var n = 0; n < mvcrenderScopeNodes.length; n++) {
      $mvc.mapNode.mold(mvcrenderScopeNodes[n].attributes['x-render']['value'], mvcrenderScopeNodes[n]);
    }
  }

  /*  @description Generate a marked html dom into a mvcNodeMold.
   *  @param {Node} HTMLCollection
   *  @return {Object} mvcNodeMold
   */
  $mvc.mapNode.mold = function (name, node, path, beforeCompile, afterCompile) {
    $mvc.mapNode.molds.push({
      "name": name,
      "node": node || document.body,
      "path": path || [],
      "nodeMarks": [],
      "nodeRepeats": [],
      "sourceHTML": node.innerHTML,
      "beforeCompile": beforeCompile,
      "afterCompile": afterCompile
    });
  };

  /*  @description Restore a compiled mvcNodeMold into marked html.
   *  @param {Object} mvcNodeMold
   *  @return {Object} mvcNodeMold
   */
  $mvc.mapNode.restore = function (renderScopePath) {
    for (var n = 0; n < $mvc.mapNode.molds.length; n++) {
      if ($mvc.mapNode.molds[n].path.join('"') === renderScopePath.join('"')) {
        restore($mvc.mapNode.molds[n]);
      }
    }
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
  $mvc.mapNode.compile = function (renderScopePath) {
    var compiledNode;
    for (var n = 0; n < $mvc.mapNode.molds.length; n++) {
      var mold = $mvc.mapNode.molds[n];
      if (mold.path.join('"') === renderScopePath.join('"')) {
        mold.beforeCompile ? mold.beforeCompile() : null;
        compiledNode = compile(renderScopePath, mold);
        mold.afterCompile ? mold.afterCompile() : null;
        break;
      }
    }
    return compiledNode || console.warn("cannot find renderScope mold by renderScopePath ['" + renderScopePath.join("']['") + "']");
  }

  function compile(renderScopePath, nodeData, rootNode) {
    rootNode = rootNode || document;
    $mvc.console('group', '$mvc compile', 5);
    $mvc.console('log', 'renderScope Name : ' + nodeData.name, '#33f', 5);
    $mvc.console('log', 'renderScope Path : ' + nodeData.path.join(' -> '), '#69f', 5);
    $mvc.console('log', 'renderScope Element TagName : ' + nodeData.node.localName, '#69f', 5);
    nodeData.node.id ? $mvc.console('log', 'renderScope Element Id : ' + nodeData.node.id, '#69f', 5) : null;
    nodeData.node.className ? $mvc.console('log', 'renderScope Element Class : ' + nodeData.node.className, '#69f', 5) : null;
    $mvc.console('time', 'Elapsed Time');
    nodeData.node = $mvc.mapNode.getElementsByAttributeName(rootNode, 'x-path', renderScopePath.join('.'))[0];
    $mvc.mapNode.restore(renderScopePath, nodeData);
    nodeData = mapRepeatNode(nodeData);
    nodeData = filtNodeMarks(nodeData);
    nodeData = compileNodeMarks(nodeData);
    $mvc.console('log', 'renderScope Repeats : ' + nodeData.nodeRepeats.length, '#69f', 5);
    $mvc.console('log', 'renderScope Marks : ' + nodeData.nodeMarks.length, '#69f', 5);
    $mvc.console('timeEnd', 'Elapsed Time', 5);
    $mvc.console('groupEnd', '$mvc compile', 5);
    return nodeData;
  };

  function mapRepeatNode(nodeData) {
    var matchTask = function (node, attributeValue, tier) {
      var tierRegExp = new RegExp('\\$' + tier, 'g');
      var tempRepeat = {
        "repeatMark": attributeValue,
        "repeatHTML": node.innerHTML,
        "repeatTier": tier
      };
      nodeData.nodeRepeats.push(tempRepeat);
      var repeatTimes = 0;
      var compileHTML = '';
      if (eval('typeof(' + tempRepeat.repeatMark + ')') === 'object') {
        for (repeatTimes; repeatTimes < eval(tempRepeat.repeatMark + '.length'); repeatTimes++) {
          var tempHTML = tempRepeat.repeatHTML;
          tempHTML = tempHTML.replace(tierRegExp, repeatTimes);
          compileHTML = compileHTML + tempHTML;
        }
      } else {
        $mvc.console('warn', tempRepeat.repeatMark + ' is not Array!', null, 1);
      }
      node.innerHTML = compileHTML;
      $mvc.mapNode.mapNodeByAttributeName(node, 'x-repeat', tier + 1, matchTask);
    }
    nodeData.node = $mvc.mapNode.mapNodeByAttributeName(nodeData.node, 'x-repeat', 0, matchTask);
    return nodeData;
  }

  function filtNodeMarks(nodeData) {
    nodeData.nodeMarks = nodeData.node.innerHTML.match($mvc.regex.nodeMark) || [];
    return nodeData;
  }

  function compileNodeMarks(nodeData) {
    var htmlStr = nodeData.node.innerHTML;
    var mapedMarks = nodeData.nodeMarks;
    var mark3LRegex = new RegExp('{{{');
    var mark3RRegex = new RegExp('}}}');
    var markFixRegex = [new RegExp('{', 'g'), new RegExp('}', 'g'), new RegExp('<', 'g'), new RegExp('>', 'g'), new RegExp('}}=""', 'g'), new RegExp('\"', 'g'), ];
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

  root.$x = $mvc;
})(this);
