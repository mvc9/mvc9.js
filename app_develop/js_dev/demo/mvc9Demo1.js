$mvc.onload(function() {

	window.view = {};
	window.model = {};
	$mvc.debug = true;


	//给 part1 的{{变量}}标记赋值
	model.string1 = 'Hello! MVC9.';
	//以id="part1"的元素为根节点初始化模板(返回一个$mvc模板变量，存在view.part1里)
	view.part1 = $mvc.mapNode.model(document.getElementById('part1'));
	//执行模板编译(编译一个$mvc模板)
	view.part1 = $mvc.mapNode.compile(view.part1); //╮(╯▽╰)╭完了，三步搞定！

	//part2
	model.number = 100;
	view.part2 = $mvc.mapNode.model(document.getElementById('part2'));
	view.part2 = $mvc.mapNode.compile(view.part2);

	//part3
	model.array = ['Asia', 'America', 'Europe'];
	view.part3 = $mvc.mapNode.model(document.getElementById('part3'));
	view.part3 = $mvc.mapNode.compile(view.part3);


	//part4
	model.object = [{
		"continent": 'Asia',
		"country": [{
			"countryName": 'China',
			"city": [
				'Hongkong',
				'ShangHai',
				'Nanjing'
			]
		}, {
			"countryName": 'Jepan',
			"city": [
				'Tokyo',
				'Osaka'
			]
		}]
	}, {
		"continent": 'Europe',
		"country": [{
			"countryName": 'UK',
			"city": [
				'London',
				'England'
			]
		}, {
			"countryName": 'Russian',
			"city": [
				'Moscow',
				'St.Petersburg',
				'Kiev'
			]
		}]
	}, {
		"continent": 'America',
		"country": [{
			"countryName": 'US',
			"city": [
				'Washington',
				'San Francisco',
				'New York'
			]
		}]
	}]
	view.part4 = $mvc.mapNode.model(document.getElementById('part4'));
	view.part4 = $mvc.mapNode.compile(view.part4);

	//event
	window.appEvent = {};
	appEvent.clickCity = function(a, b, c) {
		console.log(
			model.object[a].continent+' '+
			model.object[a].country[b].countryName+' '+
			model.object[a].country[b].city[c]
		);
	}

	// 以下是懒人专用(不传参数默认读取body节点作为模板编译)
	// $mvc.mapNode.model();
	// $mvc.mapNode.compile();
});
