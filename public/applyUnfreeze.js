var currentTime;

window.onload = function () {
	currentTime = parseInt($(timeleft).text());
	transferTime();


};

function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return unescape(r[2]);
	return "";
}
function fgoback() {
	window.location.href = "/person?addr=" + GetQueryString("addr");
}

function transferTime() {
	var theTime = currentTime;
	var dayCount = Math.floor(theTime / (60 * 60 * 24));
	var dayLeft = theTime % (60 * 60 * 24);
	var hourCount = Math.floor(dayLeft / (60 * 60));
	var hourLeft = dayLeft % (60 * 60);
	var minuteCount = Math.floor(hourLeft / (60));
	var secondCount = hourLeft % (60);
	
	$(timeleft2).html(dayCount + "天" + hourCount + "小时" + minuteCount + "分钟" + secondCount + "秒");
	currentTime = currentTime-1;
	t=setTimeout("transferTime()",1000);

	// return dayCount + "天" + hourCount + "小时" + minuteCount + "分钟" + secondCount + "秒";
	// return dayCount + "天" + hourCount + "小时" + minuteCount + "分钟";
}