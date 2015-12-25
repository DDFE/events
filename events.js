/**
 *  事件管理中心，用于监听，派发事件
 */
var _listenerMap = {},
	slice = [].slice;

function call(callback, args) {
	var fn = callback[0],
		context = callback[1],
		args = callback[2].concat(args);
	try {
		return fn.apply(context, args);
	} catch (e) {
		setTimeout(function () {
			throw e;
		}, 0);
	}
}

function arrayClone(arr, len) {
	var copy = new Array(len);
	while (len--)
		copy[len] = arr[len];
	return copy;
}

function emit(type, args) {
	var listenerList = _listenerMap[type];
	if (!listenerList)
		return true;
	args = slice.call(arguments, 1);
	var len = listenerList.cbs.length;
	var cbs = arrayClone(listenerList.cbs, len);
	var ret = true;
	for (var index = 0; index < len; index++) {
		if (!cbs[index])
			continue;
		ret = call(cbs[index], args) !== false && ret;
	}
	return !!ret;
}

var events = {
	on: function (type, fn, context) {
		var listenerList,
			callback, args;
		if (!(listenerList = _listenerMap[type])) {
			_listenerMap[type] = listenerList = {
				args: null,
				cbs: []
			};
		}

		callback = [fn, context, slice.call(arguments, 3)];
		if (args = listenerList.args) {
			call(callback, args);
		} else {
			listenerList.cbs.push(callback);
		}
	},
	un: function (type, fn) {
		var listenerList = _listenerMap[type],
			cbs, count;
		if (!listenerList)
			return true;
		if (arguments.length == 1) {
			listenerList.cbs = [];
		} else {
			cbs = listenerList.cbs;
			count = cbs.length;
			while (count--) {
				if (cbs[count] && cbs[count][0] === fn) {
					cbs.splice(count, 1);
				}
			}
		}
	},
	emit: function (type, args) {
		return emit.apply(this, arguments);
	},
	done: function (type, args) {
		var listenerList, ret, cbs, count;
		if (!(listenerList = _listenerMap[type])) {
			_listenerMap[type] = listenerList = {
				args: args,
				cbs: []
			};
		}
		cbs = listenerList.cbs;
		count = cbs.length;

		ret = emit.apply(this, arguments);

		args = slice.call(arguments, 1);
		listenerList.args = args;
		listenerList.cbs = cbs.slice(count);
	},
	undo: function (type) {
		var listenerList = _listenerMap[type];
		if (!listenerList)
			return false;
		listenerList.args = null;
	}
};

module.exports = events;
