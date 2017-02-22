/*
*  xml2json({XML String});
*  json2xml({JSON String});
*/

if (typeof(XML) == 'undefined') XML = function() {};
XML.ObjTree = function() {
    return this;
};
XML.ObjTree.VERSION = "0.23";
XML.ObjTree.prototype.xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>\n';
XML.ObjTree.prototype.attr_prefix = '-';
XML.ObjTree.prototype.parseXML = function(xml) {
    var root;
    if (window.DOMParser) {
        var xmldom = new DOMParser();
        var dom = xmldom.parseFromString(xml, "application/xml");
        if (!dom) return;
        root = dom.documentElement;
    } else if (window.ActiveXObject) {
        xmldom = new ActiveXObject('Microsoft.XMLDOM');
        xmldom.async = false;
        xmldom.loadXML(xml);
        root = xmldom.documentElement;
    }
    if (!root) return;
    return this.parseDOM(root);
};
XML.ObjTree.prototype.parseHTTP = function(url, options, callback) {
    var myopt = {};
    for (var key in options) {
        myopt[key] = options[key];
    }
    if (!myopt.method) {
        if (typeof(myopt.postBody) == "undefined" && typeof(myopt.postbody) == "undefined" && typeof(myopt.parameters) == "undefined") {
            myopt.method = "get";
        } else {
            myopt.method = "post";
        }
    }
    if (callback) {
        myopt.asynchronous = true;
        var __this = this;
        var __func = callback;
        var __save = myopt.onComplete;
        myopt.onComplete = function(trans) {
            var tree;
            if (trans && trans.responseXML && trans.responseXML.documentElement) {
                tree = __this.parseDOM(trans.responseXML.documentElement);
            }
            __func(tree, trans);
            if (__save) __save(trans);
        };
    } else {
        myopt.asynchronous = false;
    }
    var trans;
    if (typeof(HTTP) != "undefined" && HTTP.Request) {
        myopt.uri = url;
        var req = new HTTP.Request(myopt);
        if (req) trans = req.transport;
    } else if (typeof(Ajax) != "undefined" && Ajax.Request) {
        var req = new Ajax.Request(url, myopt);
        if (req) trans = req.transport;
    }
    if (callback) return trans;
    if (trans && trans.responseXML && trans.responseXML.documentElement) {
        return this.parseDOM(trans.responseXML.documentElement);
    }
}
XML.ObjTree.prototype.parseDOM = function(root) {
    if (!root) return;
    this.__force_array = {};
    if (this.force_array) {
        for (var i = 0; i < this.force_array.length; i++) {
            this.__force_array[this.force_array[i]] = 1;
        }
    }
    var json = this.parseElement(root);
    if (this.__force_array[root.nodeName]) {
        json = [json];
    }
    if (root.nodeType != 11) {
        var tmp = {};
        tmp[root.nodeName] = json;
        json = tmp;
    }
    return json;
};
XML.ObjTree.prototype.parseElement = function(elem) {
    if (elem.nodeType == 7) {
        return;
    }
    if (elem.nodeType == 3 || elem.nodeType == 4) {
        var bool = elem.nodeValue.match(/[^\x00-\x20]/);
        if (bool == null) return;
        return elem.nodeValue;
    }
    var retval;
    var cnt = {};
    if (elem.attributes && elem.attributes.length) {
        retval = {};
        for (var i = 0; i < elem.attributes.length; i++) {
            var key = elem.attributes[i].nodeName;
            if (typeof(key) != "string") continue;
            var val = elem.attributes[i].nodeValue;
            if (!val) continue;
            key = this.attr_prefix + key;
            if (typeof(cnt[key]) == "undefined") cnt[key] = 0;
            cnt[key]++;
            this.addNode(retval, key, cnt[key], val);
        }
    }
    if (elem.childNodes && elem.childNodes.length) {
        var textonly = true;
        if (retval) textonly = false;
        for (var i = 0; i < elem.childNodes.length && textonly; i++) {
            var ntype = elem.childNodes[i].nodeType;
            if (ntype == 3 || ntype == 4) continue;
            textonly = false;
        }
        if (textonly) {
            if (!retval) retval = "";
            for (var i = 0; i < elem.childNodes.length; i++) {
                retval += elem.childNodes[i].nodeValue;
            }
        } else {
            if (!retval) retval = {};
            for (var i = 0; i < elem.childNodes.length; i++) {
                var key = elem.childNodes[i].nodeName;
                if (typeof(key) != "string") continue;
                var val = this.parseElement(elem.childNodes[i]);
                if (!val) continue;
                if (typeof(cnt[key]) == "undefined") cnt[key] = 0;
                cnt[key]++;
                this.addNode(retval, key, cnt[key], val);
            }
        }
    }
    return retval;
};
XML.ObjTree.prototype.addNode = function(hash, key, cnts, val) {
    if (this.__force_array[key]) {
        if (cnts == 1) hash[key] = [];
        hash[key][hash[key].length] = val;
    } else if (cnts == 1) {
        hash[key] = val;
    } else if (cnts == 2) {
        hash[key] = [hash[key], val];
    } else {
        hash[key][hash[key].length] = val;
    }
};
XML.ObjTree.prototype.writeXML = function(tree) {
    var xml = this.hash_to_xml(null, tree);
    return this.xmlDecl + xml;
};
XML.ObjTree.prototype.hash_to_xml = function(name, tree) {
    var elem = [];
    var attr = [];
    for (var key in tree) {
        if (!tree.hasOwnProperty(key)) continue;
        var val = tree[key];
        if (key.charAt(0) != this.attr_prefix) {
            if (typeof(val) == "undefined" || val == null) {
                elem[elem.length] = "<" + key + " />";
            } else if (typeof(val) == "object" && val.constructor == Array) {
                elem[elem.length] = this.array_to_xml(key, val);
            } else if (typeof(val) == "object") {
                elem[elem.length] = this.hash_to_xml(key, val);
            } else {
                elem[elem.length] = this.scalar_to_xml(key, val);
            }
        } else {
            attr[attr.length] = " " + (key.substring(1)) + '="' + (this.xml_escape(val)) + '"';
        }
    }
    var jattr = attr.join("");
    var jelem = elem.join("");
    if (typeof(name) == "undefined" || name == null) {} else if (elem.length > 0) {
        if (jelem.match(/\n/)) {
            jelem = "<" + name + jattr + ">\n" + jelem + "</" + name + ">\n";
        } else {
            jelem = "<" + name + jattr + ">" + jelem + "</" + name + ">\n";
        }
    } else {
        jelem = "<" + name + jattr + " />\n";
    }
    return jelem;
};
XML.ObjTree.prototype.array_to_xml = function(name, array) {
    var out = [];
    for (var i = 0; i < array.length; i++) {
        var val = array[i];
        if (typeof(val) == "undefined" || val == null) {
            out[out.length] = "<" + name + " />";
        } else if (typeof(val) == "object" && val.constructor == Array) {
            out[out.length] = this.array_to_xml(name, val);
        } else if (typeof(val) == "object") {
            out[out.length] = this.hash_to_xml(name, val);
        } else {
            out[out.length] = this.scalar_to_xml(name, val);
        }
    }
    return out.join("");
};
XML.ObjTree.prototype.scalar_to_xml = function(name, text) {
    if (name == "#text") {
        return this.xml_escape(text);
    } else {
        return "<" + name + ">" + this.xml_escape(text) + "</" + name + ">\n";
    }
};
XML.ObjTree.prototype.xml_escape = function(text) {
    return (text + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

window.xml2json = function(xmlStr) {
    xmlStr = repalceFh(xmlStr);
    var tempObj = new XML.ObjTree();
    var tempJson = tempObj.parseXML(xmlStr);

    function repalceFh(c) {
        return c.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"");
    }
    return tempJson;
}
window.json2xml = function(jsonStr) {
    var tempObj = new XML.ObjTree();
    return tempObj.writeXML(jsonStr);
}