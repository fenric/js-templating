'use strict';

/**
 * It is free open-source software released under the MIT License.
 *
 * @author Anatoly Fenric <a.fenric@gmail.com>
 * @copyright Copyright (c) 2017 by Fenric Laboratory
 * @license https://raw.githubusercontent.com/fenric/js.bugaboo/master/LICENSE
 * @link https://github.com/fenric/js.bugaboo
 */

var $bugaboo;

/**
 * Конструктор компонента
 *
 * @param   string   content
 * @param   object   request
 *
 * @access  public
 * @return  void
 */
$bugaboo = function(content, request)
{
	this.content = content;
	this.request = request;

	this.expressions = {};

	this.expressions.repeats = "{{repeat ([\\w\\.]+)}}([\\s\\S]*?){{endrepeat \\1}}";

	this.expressions.lists = "{{list ([\\w\\.]+) start=([\\w\\d\\.]+) end=([\\w\\d\\.]+)\\040?(?:as=([\\w]+))?}}([\\s\\S]*?){{endlist \\1}}";

	this.expressions.conditions = "{{when ([\\w\\.]+) ([\\w\\040]+)(?:\\040\\|\\040(.*?))?}}([\\s\\S]*?){{endwhen \\1}}";

	this.expressions.elementary = "{{([\\w\\.]+)(?:\\|(.*?))?(?:\\:(.*?)(?:\\050(.*?)\\051)?)?}}";

	this.expressions.eval = "{{@([\\s\\S]*?)}}";
};

/**
 * Получение версии компонента
 *
 * @access  public
 * @return  string
 */
$bugaboo.getVersion = function()
{
	return '1.0.0';
};

/**
 * Является ли операнд нулевым
 *
 * @access  public
 * @return  bool
 */
$bugaboo.isNull = function(value)
{
	return Object.prototype.toString.call(value).localeCompare('[object Null]') === 0;
};

/**
 * Является ли операнд неопределённым
 *
 * @access  public
 * @return  bool
 */
$bugaboo.isUndefined = function(value)
{
	return Object.prototype.toString.call(value).localeCompare('[object Undefined]') === 0;
};

/**
 * Является ли операнд функцией
 *
 * @access  public
 * @return  bool
 */
$bugaboo.isFunction = function(value)
{
	return Object.prototype.toString.call(value).localeCompare('[object Function]') === 0;
};

/**
 * Является ли операнд булевым
 *
 * @access  public
 * @return  bool
 */
$bugaboo.isBoolean = function(value)
{
	return Object.prototype.toString.call(value).localeCompare('[object Boolean]') === 0;
};

/**
 * Является ли операнд объектом
 *
 * @access  public
 * @return  bool
 */
$bugaboo.isObject = function(value)
{
	return Object.prototype.toString.call(value).localeCompare('[object Object]') === 0;
};

/**
 * Является ли операнд массивом
 *
 * @access  public
 * @return  bool
 */
$bugaboo.isArray = function(value)
{
	return Object.prototype.toString.call(value).localeCompare('[object Array]') === 0;
};

/**
 * Является ли операнд числом
 *
 * @access  public
 * @return  bool
 */
$bugaboo.isNumber = function(value)
{
	return Object.prototype.toString.call(value).localeCompare('[object Number]') === 0;
};

/**
 * Является ли операнд строкой
 *
 * @access  public
 * @return  bool
 */
$bugaboo.isString = function(value)
{
	return Object.prototype.toString.call(value).localeCompare('[object String]') === 0;
};

/**
 * Является ли операнд скалярным
 *
 * @access  public
 * @return  bool
 */
$bugaboo.isScalar = function(value)
{
	return ($bugaboo.isNumber(value) || $bugaboo.isString(value));
};

/**
 * {description}
 *
 * @access  public
 * @return  void
 */
$bugaboo.prototype.format = function(params, stringable)
{
	var content = this.content;

	params = params || {};

	if ($bugaboo.isObject(params))
	{
		if (params.date === undefined)
		{
			params.date = new Date();
		}

		for (var key in $bugaboo.elementary)
		{
			params[key] = $bugaboo.elementary[key];
		}
	}

	content = this.formatRepeats(content, params);
	content = this.formatLists(content, params);
	content = this.formatConditions(content, params);
	content = this.formatElementary(content, params);
	content = this.formatEval(content, params);

	return stringable ? content : this.fragmentation(content);
};

/**
 * {description}
 *
 * @access  public
 * @return  void
 */
$bugaboo.prototype.formatRepeats = function(content, params)
{
	var match, value, template, replacement;

	var expression = new RegExp(this.expressions.repeats);

	while (match = content.match(expression))
	{
		value = this.pointwisely(params, match[1]);

		template = new $bugaboo(match[2]);

		replacement = '';

		if (value instanceof Array)
		{
			value.forEach(function(iterationParams, iterationIndex)
			{
				iterationParams = iterationParams || {};

				if ($bugaboo.isObject(iterationParams))
				{
					iterationParams['__parent__'] = params;
					iterationParams['__index__'] = iterationIndex;

					iterationParams['__first__'] = iterationIndex === 0;
					iterationParams['__last__'] = iterationIndex === (value.length - 1);
				}

				replacement += template.format(iterationParams, true);
			});
		}

		content = content.replace(match[0], replacement);
	}

	return content;
};

/**
 * {description}
 *
 * @access  public
 * @return  void
 */
$bugaboo.prototype.formatLists = function(content, params)
{
	var match, scope, start, end, index, iscope, template, replacement;

	var expression = new RegExp(this.expressions.lists);

	while (match = content.match(expression))
	{
		scope = this.pointwisely(params, match[1]) || {};

		template = new $bugaboo(match[5]);

		replacement = '';

		start = end = 0;

		if (/^\d+$/.test(this.pointwisely(params, match[2]))) {
			start = this.pointwisely(params, match[2]);
		}
		else if (/^\d+$/.test(scope[match[2]])) {
			start = scope[match[2]];
		}
		else if (/^\d+$/.test(match[2])) {
			start = match[2];
		}

		if (/^\d+$/.test(this.pointwisely(params, match[3]))) {
			end = this.pointwisely(params, match[3]);
		}
		else if (/^\d+$/.test(scope[match[3]])) {
			end = scope[match[3]];
		}
		else if (/^\d+$/.test(match[3])) {
			end = match[3];
		}

		if (start >= 1)
		{
			if (start <= end)
			{
				for (index = start; index <= end; index++)
				{
					iscope = scope;

					iscope[match[4] || '__index__'] = index;

					iscope['__parent__'] = params;

					replacement += template.format(iscope, true);
				}
			}
		}

		content = content.replace(match[0], replacement);
	}

	return content;
};

/**
 * {description}
 *
 * @access  public
 * @return  void
 */
$bugaboo.prototype.formatConditions = function(content, params)
{
	var match, value, right, condition;

	var expression = new RegExp(this.expressions.conditions);

	while (match = content.match(expression))
	{
		value = this.pointwisely(params, match[1]);

		condition = false;

		if ($bugaboo.conditions[match[2]] instanceof Function)
		{
			// Правая часть выражения может быть не указана
			right = match[3] || '';

			// Если правая часть выражения начинается с `this.` значит вызывается параметр
			if (right.indexOf('this.') === 0)
			{
				right = this.pointwisely(params, right.substring(5));
			}

			condition = !! $bugaboo.conditions[match[2]].call(params, value, right);
		}

		content = content.replace(match[0], condition ? match[4] : '');
	}

	return content;
};

/**
 * {description}
 *
 * @access  public
 * @return  void
 */
$bugaboo.prototype.formatElementary = function(content, params)
{
	var match, value;

	var expression = new RegExp(this.expressions.elementary);

	while (match = content.match(expression))
	{
		value = this.pointwisely(params, match[1]) || match[2] || '';

		if (match[3] !== undefined)
		{
			if ($bugaboo.formatters[match[3]] !== undefined)
			{
				if ($bugaboo.formatters[match[3]] instanceof Function)
				{
					value = $bugaboo.formatters[match[3]].call(params, value, match[4] || null);
				}
			}
		}

		value = $bugaboo.e(value.toString());

		content = content.replace(match[0], value);
	}

	return content;
};

/**
 * {description}
 *
 * @access  public
 * @return  void
 */
$bugaboo.prototype.formatEval = function(content, params)
{
	var match;

	var expression = new RegExp(this.expressions.eval);

	while (match = content.match(expression))
	{
		content = content.replace(match[0], (function()
		{
			return eval(match[1]);

		}).call(params));
	}

	return content;
};

/**
 * {description}
 *
 * @access  public
 * @return  void
 */
$bugaboo.prototype.pointwisely = function(object, notation)
{
	if (notation.localeCompare('this') === 0)
	{
		return object;
	}

	var result = object;

	var segments = notation.split('.');

	var segment;

	while (segment = segments.shift())
	{
		if (result instanceof Object)
		{
			result = result[segment];

			continue;
		}

		break;
	}

	return result;
};

/**
 * {description}
 *
 * @access  public
 * @return  void
 */
$bugaboo.prototype.fragmentation = function(html)
{
	var fragment, container, node;

	fragment = document.createDocumentFragment();

	container = document.createElement('div');

	container.innerHTML = html;

	for (node = 0; node < container.childNodes.length; node++)
	{
		if (container.childNodes[node].nodeType === Node.ELEMENT_NODE)
		{
			fragment.appendChild(container.childNodes[node]);
		}
	}

	return fragment;
};

/**
 * {description}
 *
 * @access  public
 * @return  void
 */
$bugaboo.load = function(url, complete)
{
	var xhr = new XMLHttpRequest();

	xhr.open('GET', (url + (url.indexOf('?') < 0 ? '?' : '&') + Math.random()), true);

	xhr.setRequestHeader('Content-Type', 'text/html');

	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

	xhr.onload = function(event)
	{
		if (this.status === 200 && complete instanceof Function)
		{
			complete.call(this, new $bugaboo(this.responseText, this));
		}

		if (this.status === 404 && this.onnotfound instanceof Function)
		{
			this.onnotfound.call(this, event);
		}

		if (this.oncomplete instanceof Function)
		{
			this.oncomplete.call(this, event);
		}
	};

	xhr.notfound = function(callback)
	{
		xhr.onnotfound = callback;
	};

	xhr.complete = function(callback)
	{
		xhr.oncomplete = callback;
	};

	xhr.send();

	return xhr;
};

/**
 * {description}
 *
 * @access  public
 * @return  void
 */
$bugaboo.e = function(string)
{
	string = string.replace(new RegExp('<', 'g'), '&lt;');
	string = string.replace(new RegExp('>', 'g'), '&gt;');

	string = string.replace(new RegExp('"', 'g'), '&quot;');

	return string;
};

/**
 * Глобальные условные функции и элементарные теги
 */
$bugaboo.conditions = new Object();
$bugaboo.elementary = new Object();
$bugaboo.formatters = new Object();

/**
 * Для работы с модулями и компонентами…
 */
$bugaboo.elementary['_module'] = new Object();
$bugaboo.elementary['_component'] = new Object();

/**
 * Является ли значение пустым
 */
$bugaboo.conditions['is empty'] = function(value)
{
	// function, object, array, etc.
	if (value instanceof Object)
	{
		return Object.keys(value).length === 0;
	}

	// boolean, number, string, null, void, etc.
	return ! value;
};

$bugaboo.conditions['is not empty'] = function(value)
{
	return ! $bugaboo.conditions['is empty'](value);
};

/**
 * Эквивалентно ли значение NULL
 */
$bugaboo.conditions['is null'] = function(value)
{
	return value === null;
};

$bugaboo.conditions['is not null'] = function(value)
{
	return ! $bugaboo.conditions['is null'](value);
};

/**
 * Эквивалентно ли значение TRUE
 */
$bugaboo.conditions['is true'] = function(value)
{
	return value === true || value === 1;
};

$bugaboo.conditions['is not true'] = function(value)
{
	return ! $bugaboo.conditions['is true'](value);
};

/**
 * Эквивалентно ли значение FALSE
 */
$bugaboo.conditions['is false'] = function(value)
{
	return value === false || value === 0;
};

$bugaboo.conditions['is not false'] = function(value)
{
	return ! $bugaboo.conditions['is false'](value);
};

/**
 * Является ли значение неопределённым
 */
$bugaboo.conditions['is undefined'] = function(value)
{
	return value === undefined;
};

$bugaboo.conditions['is not undefined'] = function(value)
{
	return ! $bugaboo.conditions['is undefined'](value);
};

/**
 * Сравнение левого операнда со значением
 */
$bugaboo.conditions['is equal'] = function(left, right)
{
	if ($bugaboo.conditions['is numeric'](left, right))
	{
		return parseFloat(left) === parseFloat(right);
	}

	return left == right;
};

$bugaboo.conditions['is not equal'] = function(left, right)
{
	if ($bugaboo.conditions['is numeric'](left, right))
	{
		return parseFloat(left) !== parseFloat(right);
	}

	return left != right;
};

$bugaboo.conditions['is less than'] = function(left, right)
{
	if ($bugaboo.conditions['is numeric'](left, right))
	{
		return parseFloat(left) < parseFloat(right);
	}

	return left < right;
};

$bugaboo.conditions['is greater than'] = function(left, right)
{
	if ($bugaboo.conditions['is numeric'](left, right))
	{
		return parseFloat(left) > parseFloat(right);
	}

	return left > right;
};

$bugaboo.conditions['is less or equal than'] = function(left, right)
{
	if ($bugaboo.conditions['is numeric'](left, right))
	{
		return parseFloat(left) <= parseFloat(right);
	}

	return left <= right;
};

$bugaboo.conditions['is greater or equal than'] = function(left, right)
{
	if ($bugaboo.conditions['is numeric'](left, right))
	{
		return parseFloat(left) >= parseFloat(right);
	}

	return left >= right;
};

/**
 * Является ли операнд числом
 */
$bugaboo.conditions['is numeric'] = function()
{
	var index, value;

	for (index = 0; index < arguments.length; index++)
	{
		if ($bugaboo.isScalar(arguments[index]))
		{
			value = arguments[index].toString();

			if (/^(?:-)?\d+(?:\.\d+)?$/.test(value))
			{
				continue;
			}
		}

		return false;
	}

	return true;
};

$bugaboo.conditions['is not numeric'] = function()
{
	return ! $bugaboo.conditions['is numeric'].apply(null, arguments);
};

/**
 * Существование значения в массиве
 */
$bugaboo.conditions['in array'] = function(value, array)
{
	var index;

	if ($bugaboo.isArray(array))
	{
		for (index = 0; index < array.length; index++)
		{
			if (array[index] == value)
			{
				return true;
			}
		}
	}

	return false;
};

$bugaboo.conditions['not in array'] = function(value, array)
{
	return ! $bugaboo.conditions['in array'](value, array);
};

/**
 * Существование значения в объекте
 */
$bugaboo.conditions['in object'] = function(value, object)
{
	var key;

	if ($bugaboo.isObject(object))
	{
		for (key in object)
		{
			if (object[key] == value)
			{
				return true;
			}
		}
	}

	return false;
};

$bugaboo.conditions['not in object'] = function(value, object)
{
	return ! $bugaboo.conditions['in object'](value, object);
};

/**
 * Форматирование размера
 */
$bugaboo.formatters['size'] = function(value)
{
	var round, unit;

	round = value;
	unit = 'B';

	if (round > 1024) {
		round /= 1024;
		unit = 'Kb';

		if (round > 1024) {
			round /= 1024;
			unit = 'Mb';

			if (round > 1024) {
				round /= 1024;
				unit = 'Gb';
			}
		}
	}

	return Math.floor(round) + ' ' + unit;
};

/**
 * Форматирование телефонного номера
 */
$bugaboo.formatters['phone'] = function(value)
{
	if (/^9\d{9}$/.test(value)) {
		value = value.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '8 ($1) $2-$3-$4');
	}
	else if (/^800\d{7}$/.test(value)) {
		value = value.replace(/(\d{3})(\d{4})(\d{3})/, '8 ($1) $2-$3');
	}
	else if (/^\d{10}$/.test(value)) {
		value = value.replace(/(\d{4})(\d{3})(\d{3})/, '8 ($1) $2-$3');
	}

	return value;
};

/**
 * Форматирование даты
 */
$bugaboo.formatters['date'] = function(value, mask)
{
	var date, parts, year, month, day, hours, minutes, seconds, quarter, tQuarter;

	if (value === 'now') {
		value = (new Date).toString();
	}

	date = new Date(value);

	if (isNaN(date.getTime())) {
		return value;
	}

	parts = new Array();

	year = date.getFullYear();
	month = date.getMonth() + 1;
	day = date.getDate();
	hours = date.getHours();
	minutes = date.getMinutes();
	seconds = date.getSeconds();
	quarter = tQuarter = null;

	if (month >= 1 && month <= 3) {
		quarter = 1;
		tQuarter = 'I';
	}
	else if (month >= 4 && month <= 6) {
		quarter = 2;
		tQuarter = 'II';
	}
	else if (month >= 7 && month <= 9) {
		quarter = 3;
		tQuarter = 'III';
	}
	else if (month >= 10 && month <= 12) {
		quarter = 4;
		tQuarter = 'IV';
	}

	if (month < 10) {
		month = '0' + month;
	}
	if (day < 10) {
		day = '0' + day;
	}
	if (hours < 10) {
		hours = '0' + hours;
	}
	if (minutes < 10) {
		minutes = '0' + minutes;
	}
	if (seconds < 10) {
		seconds = '0' + seconds;
	}

	mask = mask || 'd.m.Y';

	for (var i = 0; i < mask.length; i++)
	{
		switch (mask[i])
		{
			case 'Y' :
				parts.push(year);
				break;

			case 'm' :
				parts.push(month);
				break;

			case 'd' :
				parts.push(day);
				break;

			case 'H' :
				parts.push(hours);
				break;

			case 'i' :
				parts.push(minutes);
				break;

			case 's' :
				parts.push(seconds);
				break;

			case 'q' :
				parts.push(quarter);
				break;

			case 'Q' :
				parts.push(tQuarter);
				break;

			default :
				parts.push(mask[i]);
				break;
		}
	}

	return parts.join('');
};

/**
 * Форматирование число
 *
 * @todo не полагаться на стандартные средства движка...
 */
$bugaboo.formatters['numeric'] = function(value, args)
{
	args = args || '';

	args = args.split(',').map(function(arg)
	{
		arg = arg.replace(/^\s+/, '');
		arg = arg.replace(/\s+$/, '');

		return arg;
	});

	value = parseFloat(value);

	value = value.toFixed(args[0] || 2);

	value = parseFloat(value);

	return value.toLocaleString();
};
