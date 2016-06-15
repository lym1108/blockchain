window.onload = function () {
	$(timeleft2).html(transferTime($(timeleft).text()));


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

function transferTime(timeValue) {
	var theTime = parseInt(timeValue);
	var dayCount = Math.floor(theTime / (60 * 60 * 24));
	var dayLeft = theTime % (60 * 60 * 24);
	var hourCount = Math.floor(dayLeft / (60 * 60));
	var hourLeft = hourCount % (60 * 60);
	var minuteCount = Math.floor(hourLeft / (60));
	var secondCount = hourLeft % (60);

	// return dayCount + "天" + hourCount + "小时" + minuteCount + "分钟" + secondCount + "秒";
	return dayCount + "天" + hourCount + "小时" + minuteCount + "分钟";
}