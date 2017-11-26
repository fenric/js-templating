# Lite JavaScript templating!

### Install via bower
```
bower install fenric-js-templating
```

### Using after install via bower
```
<script src="bower_components/fenric-js-templating/src/bugaboo.js"></script>
```

### Example template load
```
var data = {};

$bugaboo.load('/assets/views/test.tpl', function(tpl)
{
	container.appendChild(tpl.format(data));
});
```

### Templates features
```
<!-- Print escaped variable value -->
<!-- tpl.format({
	title: "value",
}) -->
{{title}}

<!-- Print escaped variable value with default value -->
<!-- tpl.format({}) -->
{{title|Default title}}

<!-- Print escaped variable value with default value and calling handler without params -->
<!-- tpl.format({}) -->
{{title|Default title:processor}}

<!-- Print escaped variable value and calling handler with parameter -->
<!-- tpl.format({}) -->
{{title:processor(test)}}

<!-- Print unescaped variable value (as it is) -->
<!-- tpl.format({
	title: "value",
}) -->
{{@ this.title; }}

<!-- JavaScript sandbox -->
<!-- tpl.format({
	testVariable: null,
}) -->
{{@
	console.dir(this);
}}

<!-- Repeats -->
<!-- tpl.format({
	testVariable: null,
	items: [
		{a: 1, b: 2, c: 3},
		{a: 4, b: 5, c: 6},
		{a: 7, b: 8, c: 9},
	],
}) -->
{{repeat items}}
	{{when __first__ is true}}
		<!-- It's first item. -->
	{{endwhen __first__}}

	{{when __last__ is true}}
		<!-- It's last item. -->
	{{endwhen __last__}}

	<!-- Using parent scope: -->
	{{__parent__.testVariable|unknown}}

	<!-- Using current scope: -->
	{{a}}, {{b}}, {{c}}

	<!-- Current index: -->
	{{__index__}}

	<!-- Supported nesting repeats... -->
{{endrepeat items}}

<!-- Conditions -->
<!-- tpl.format({
	testVariable: null,
}) -->
{{when testVariable is empty}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is not empty}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is null}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is not null}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is true}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is not true}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is false}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is not false}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is undefined}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is not undefined}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is equal | test}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is not equal | test}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is less than | 1}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is greater than | 1}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is less or equal than | 1}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is greater or equal than | 1}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is numeric}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable is not numeric}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable in array | test}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable not in array | test}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable in object | test}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable not in object | test}}
	<!-- some code -->
{{endwhen testVariable}}

{{when testVariable test regular expression | ^test$}}
	<!-- some code -->
{{endwhen testVariable}}
```
