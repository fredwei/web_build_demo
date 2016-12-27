var _base = require('module/base/base');

_base.init();

const _age = 18;

const square = n => n * n;

console.log('home is ' + square(_age));

$(function(){
	$('*').css('outline', '1px solid #666');
});