$mvc.onload(function() {

	window.view = {};
	window.model = {};
	$mvc.mode='dev';


	//给 part1 的{{变量}}标记赋值
	model.string1 = '<a>Hello! MVC9.</a>';

	//part2
	model.number = 100;

	//part3
	model.array = ['loading...'];
	setTimeout(function(){
		model.array = ['Asia', 'America', 'Europe'];
		//异步操作更新数据之后使用以下方法编译模板
		$mvc.mapNode.compile('example3');
	},2000);


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

	//event
	window.appEvent = {};
	appEvent.clickCity = function(a, b, c) {
		var message=model.object[a].continent+' '+model.object[a].country[b].countryName+' '+model.object[a].country[b].city[c];
		$mvc.console('log',message,'#ff0099');
		alert(message);
	}

});