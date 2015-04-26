/**
 * 将markdown文件转化为html文件
 */
var marked = require('./mark2html');
var ejs = require('ejs');
var fs = require('fs-extra');
var path = require('path');

buildMarkdown();

function buildMarkdown() {
	var dir = './articles-src';
	var files = fs.readdirSync(dir);
	var articleList = [];
	files.forEach(function(file) {
		var title = file.split('.')[0];
		var type = file.split('.')[1];

		var data = findArgs(fs.readFileSync(path.resolve(dir, file), 'utf-8'));
		var tmpl = fs.readFileSync('./article-tmpl.html', 'utf-8');
		var html = ejs.render(tmpl, {
			title: data.title,
			date: data.date,
			content: marked(data.data)
		});

		articleList.push({
			pos: title,
			title: data.title,
			date: data.date
		});
		
		fs.writeFile(path.resolve('./articles', title + '.html'), html);
	});

	var tmpl = fs.readFileSync('./index-tmpl.html', 'utf-8');
	var html = ejs.render(tmpl, {
		list: sortArticleList(articleList)
	});
	fs.writeFile('./index.html', html);
}

function findArgs(data) {
	var titleReg = /^@title:(.*)$/m;
	var dateReg = /^@date:(.*)$/m;
	var title = data.match(titleReg)[1];
	var date = data.match(dateReg)[1];
	data = data.replace(titleReg, '');
	data = data.replace(dateReg, '');
	return {
		title: title,
		date: date,
		data: data
	}
}


function sortArticleList(list) {
	return list.sort(function(a, b) {
		var date1 = a.date.trim().split('-');
		var date2 = b.date.trim().split('-');

		return (date2[0] * 1000 + date2[1] * 100 +  date2[2]) - (date1[0] * 1000 + date1[1] * 100 +  date1[2])
	});
}