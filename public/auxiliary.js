function formatJSON(oData, sIndent) {
	if (arguments.length < 2) {
			var sIndent = "";
	}
	// var sIndentStyle = "    ";
	var sIndentStyle = "  ";
	var sDataType = realTypeOf(oData);

	// open object
	if (sDataType == "array") {
			if (oData.length == 0) {
					return "[]";
			}
			var sHTML = "[";
	} else {
			var iCount = 0;
			$.each(oData, function() {
					iCount++;
					return;
			});
			if (iCount == 0) { // object is empty
				return "{}";
			}
			var sHTML = "{";
	}

	// loop through items
	var iCount = 0;
	$.each(oData, function(sKey, vValue) {
			if (iCount > 0) {
				sHTML += ",";
			}
			if (sDataType == "array") {
				sHTML += ("\n" + sIndent + sIndentStyle);
			} else {
				sHTML += ("\n" + sIndent + sIndentStyle + "\"" + sKey + "\"" + ": ");
			}

			// display relevant data type
			switch (realTypeOf(vValue)) {
				case "array":
				case "object":
					sHTML += formatJSON(vValue, (sIndent + sIndentStyle));
					break;
				case "boolean":
				case "number":
					sHTML += vValue.toString();
					break;
				case "null":
					sHTML += "null";
					break;
				case "string":
					sHTML += ("\"" + vValue + "\"");
					break;
				default:
					sHTML += ("TYPEOF: " + typeof(vValue));
			}

			// loop
			iCount++;
	});
	
	if (iCount > 3)
	{
		console.log("number of items: " + iCount);
	}

	// close object
	if (sDataType == "array") {
		sHTML += ("\n" + sIndent + "]");
	} else {
		sHTML += ("\n" + sIndent + "}");
	}

	// return
	return sHTML;
}

function realTypeOf(v) {
  if (typeof(v) == "object") {
    if (v === null) return "null";
    if (v.constructor == (new Array).constructor) return "array";
    if (v.constructor == (new Date).constructor) return "date";
    if (v.constructor == (new RegExp).constructor) return "regex";
    return "object";
  }
  return typeof(v);
}

// This function creates a new anchor element and uses location
// properties (inherent) to get the desired URL data. Some String
// operations are used (to normalize results across browsers).
function parseURL(url)
{
	var a =  document.createElement('a');
	a.href = url;
	return {
		source: url,
		protocol: a.protocol.replace(':',''),
		host: a.hostname,
		port: a.port,
		query: a.search,
		params: (function(){
			var ret = {},
				seg = a.search.replace(/^\?/,'').split('&'),
				len = seg.length, i = 0, s;
			for (;i<len;i++) {
				if (!seg[i]) { continue; }
				s = seg[i].split('=');
				ret[s[0]] = s[1];
			}
			return ret;
		})(),
		file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
		hash: a.hash.replace('#',''),
		path: a.pathname.replace(/^([^\/])/,'/$1'),
		relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
		segments: a.pathname.replace(/^\//,'').split('/')
	};
}

function getParam(url, param)
{
	var a =  document.createElement('a');
	a.href = url;
	var seg = a.search.replace(/^\?/,'').split('&'),
			len = seg.length, i = 0, s;
	for (; i < len; i++) {
		if (!seg[i]) { continue; }
		s = seg[i].split('=');
		if (s[0] == param)
		{
			return s[1];
		}
	}
	return null;
}

function splitId(id)
{
	var toReturn = id.replace(".", "_");
	toReturn = toReturn.replace("/", "_");
	toReturn = toReturn.replace("/", "_");
	toReturn = toReturn.replace(":", "_");
	toReturn = toReturn.replace('\+', "_");
	toReturn = toReturn.replace('\+', "_");
	return toReturn;
}

/**
 * Get cookie
 */
function getCookie(key)
{
	var cookies = document.cookie.split(';');
	for (var i = 0; i < cookies.length; i++)
	{
		if (cookies[i].indexOf('=') < 0) continue;
		key_value  = cookies[i].replace(/(^[\s]+|;)/g, '');
		deli_index = key_value.indexOf('=');
		if (key_value.substring(0, deli_index) == key)
		{
			return unescape(key_value.substring(deli_index + 1, key_value.length));
		}
	}
	return '';
};

/**
 * Function add cookie
 */
this.addCookie = function(key, value)
{
	if (!key)
	{
		return false;
	}
	document.cookie
		= key + '=' + escape(value) + '; '
		+ 'expires=Tue, 1-Jan-2030 00:00:00 GMT; '
		+ 'path=/; ';
};