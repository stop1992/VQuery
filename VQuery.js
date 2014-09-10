function addEventLoad(obj) {
	var onad = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = obj;
	} else {
		window.onload = function() {
			onad();
			obj();
		}
	}
}

function myAddEvent(obj, sEv, fn) {
	if (obj.attachEvent) {
		obj.attachEvent('on' + sEv, function() {
			if (false == fn.call(obj)) { //解决IE事件绑定的this问题!
				event.cancelBubble = true; //阻止冒泡
				return false;
			}
		});
	} else {
		obj.addEventListener(sEv, function() {
			if (false == fn.call(obj)) {
				event.cancelBubble = true; //阻止冒泡
				event.preventDefault();
			}
		}, false);
	}
}

function VQuery(vArg) {
	this.elements = [];

	switch (typeof vArg) {
		case 'function':
			myAddEvent(window, 'load', vArg);
			break;
		case 'string':
			switch (vArg.charAt(0)) {
				case "#":
					this.elements.push(document.getElementById(vArg.slice(1)));
					break;
				case ".":
					this.elements = document.getElementsByClassName(vArg.slice(1));
					break;
				default: //tagName
					this.elements = document.getElementsByTagName(vArg);
			}
			break;
		case 'object':
			this.elements.push(vArg);
	}
}

function getStyle(obj, attr) {
	if (obj.currentStyle) {
		return obj.currentStyle[attr];
	} else {
		return getComputedStyle(obj, false)[attr];
	}
}

function getByClass(oParent, sClass) {
	var aEle = oParent.getElementsByTagName('*');
	var aResult = [];

	for (var i = 0; i < aEle.length; i++) {
		if (aEle[i].className == sClass) {
			aResult.push(aEle[i]);
		}
	}
	return aResult;
}

VQuery.prototype.click = function(fn) {

	for (var i = 0; i < this.elements.length; i++) {
		myAddEvent(this.elements[i], 'click', fn);
	}
	return this; //链式操作,返回this
}

function $(vArg) {
	return new VQuery(vArg);
}

VQuery.prototype.show = function() {
	for (var i = 0; i < this.elements.length; i++) {
		this.elements[i].style.display = 'block';
	}
	return this; //链式操作,返回this
}

VQuery.prototype.hide = function() {
	for (var i = 0; i < this.elements.length; i++) {
		this.elements[i].style.display = 'none';
	}
	return this; //链式操作,返回this
}

VQuery.prototype.hover = function(fnOver, fnOut) {
	for (var i = 0; i < this.elements.length; i++) {
		myAddEvent(this.elements[i], 'mouseover', fnOver);
		myAddEvent(this.elements[i], 'mouseout', fnOut);
	}
	return this; //链式操作,返回this
}
//支持这种形式$('div').css({width:'300px',height:'300px', background: 'green'})
VQuery.prototype.css = function(attr, value) {
	if (arguments.length == 2) {
		for (var i = 0; i < this.elements.length; i++) {
			this.elements[i].style[attr] = value;
		}
	} else {
		if (typeof attr == 'string') {
			return getStyle(this.elements[0], attr);
		} else {
			for (var i = 0; i < this.elements.length; i++) {
				for (var k in attr) {
					this.elements[i].style[k] = attr[k];
				}
			}
		}
	}
	return this; //链式操作,返回this
}

//toggel函数,循环执行,第一次点执行第一个函数,第二次执行第二个..
VQuery.prototype.toggle = function() {
	var _arguments = arguments;

	for (var i = 0; i < this.elements.length; i++) {;
		(function(obj) {
			var count = 0;
			obj.onclick = function() {
				_arguments[count % _arguments.length]();
				count++;
			}
		}(this.elements[i]));
	}
	return this; //链式操作,返回this
}

//获取元素属性,也可以为元素属性赋值!
VQuery.prototype.attribute = function(attr, value) {
	if (arguments.length == 2) {
		for (var i = 0; i < this.elements.length; i++) {
			this.elements[i][attr] = value;
		}
	} else {
		return this.elements[0][attr];
	}
	return this; //链式操作,返回this
}

//假设选中了10个div,eq(5)就是获取第六个!
//返回的时候注意,这里是返回一个可以用JQuery选择的元素.
VQuery.prototype.eq = function(n) {
	return $(this.elements[n]);
}

function appendArr(arr1, arr2) {
	for (var i = 0; i < arr2.length; i++) {
		arr1.push(arr2[i]);
	}
}

//选择父级下的子元素..
VQuery.prototype.find = function(str) {
	var aResult = [];

	for (var i = 0; i < this.elements.length; i++) {
		switch (str.charAt(0)) {
			case '.':
				var temp = this.elements[i].getElementsByClassName(str.slice(1))
					//数组和其他HTMLCollaction之间不能使用concat
					// aResult = aResult.concat(temp);
				appendArr(aResult, temp);
				break;
			default:
				temp = this.elements[i].getElementsByTagName(str);
				// aResult = aResult.concat(temp);
				appendArr(aResult, temp);
		}
	}
	var VQuery_temp = $();
	VQuery_temp.elements = aResult;

	return VQuery_temp;
}

function getIndex(obj) {
	var arr = obj.parentNode.children;

	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == obj) {
			return i;
		}
	}
}

VQuery.prototype.index = function() {
	return getIndex(this.elements[0]);
}

// $(function(){
// 	$('input').click(function(){
// 		alert($(this).index());
// 	})
// })

//return false   --->  阻止冒泡和默认事件
VQuery.prototype.bind = function(sEv, fn) {
	for (var i = 0; i < this.elements.length; i++) {
		myAddEvent(this.elements[i], sEv, fn);
	}
}

VQuery.prototype.drag = function() {
	for (i = 0; i < this.elements.length; i++) {
		temp(this.elements[i]);
	}

	function temp(oDiv) {
		oDiv.onmousedown = function(ev) {
			var oEvent = ev || event;

			var disX = oEvent.clientX - oDiv.offsetLeft;
			var disY = oEvent.clientY - oDiv.offsetTop;

			document.onmousemove = function(ev) {
				var oEvent = ev || event;

				oDiv.style.left = oEvent.clientX - disX - 10 + 'px';
				oDiv.style.top = oEvent.clientY - disY - 10 + 'px';
			};

			document.onmouseup = function() {
				document.onmousemove = null;
				document.onmouseup = null;
			};
		};
	}
}

VQuery.prototype.extend = function(name, fn) {
	VQuery.prototype[name] = fn;
}

VQuery.prototype.animate = function(json) {
	for (i = 0; i < this.elements.length; i++) {
		startMove(this.elements[i], json);
	}

	function getStyle(obj, attr) {
		if (obj.currentStyle) {
			return obj.currentStyle[attr];
		} else {
			return getComputedStyle(obj, false)[attr];
		}
	}

	function startMove(obj, json, fn) {
		clearInterval(obj.timer);

		obj.timer = setInterval(function() {
			var bStop = true; //这一次运动就结束了——所有的值都到达了
			for (var attr in json) {
				//1.取当前的值
				var iCur = 0;

				if (attr == 'opacity') {
					iCur = parseInt(parseFloat(getStyle(obj, attr)) * 100);
					opacity_value = parseInt(parseFloat(json[attr]) * 100);
				} else {
					iCur = parseInt(getStyle(obj, attr));
					opacity_value = parseInt(json[attr]);
				}

				//2.算速度
				var iSpeed = (parseInt(opacity_value) - iCur) / 8;
				iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);

				//3.检测停止
				if (iCur != opacity_value) {
					bStop = false;
				}

				if (attr == 'opacity') {
					obj.style.filter = 'alpha(opacity:' + (iCur + iSpeed) + ')';
					obj.style.opacity = (iCur + iSpeed) / 100;
				} else {
					obj.style[attr] = iCur + iSpeed + 'px';
				}
			}

			if (bStop) {
				clearInterval(obj.timer);

				if (fn) {
					fn();
				}
			}
		}, 30)
	}
}