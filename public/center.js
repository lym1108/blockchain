window.onload = function() {



	$("#logon").click(function() {
		window.location.href="/logon?from=center&addr="+GetQueryString("addr");
	});

        $("#goback").click(function() {
			window.location.href="/?addr="+GetQueryString("addr");
	});

	$("#register").click(function() {
		if(GetQueryString("addr")=="")
			$("#logonResult1").html("请先登录");
		else
			window.location.href="/register?addr="+GetQueryString("addr");
	});

	$("#zhuanrang").click(function() {
		if(GetQueryString("addr")=="")
			$("#logonResult2").html("请先登录");
		else
			window.location.href="/zhuanrang?addr="+GetQueryString("addr");
	});
	$("#shourang").click(function() {
		if(GetQueryString("addr")=="")
			$("#logonResult3").html("请先登录");
		else
			window.location.href="/shourang?addr="+GetQueryString("addr");
	});
	$("#zhuanrangGD").click(function() {
		if(GetQueryString("addr")=="")
			$("#logonResult4").html("请先登录");
		else
			window.location.href="/zhuanrangGD?addr="+GetQueryString("addr");
	});
};

function GetQueryString(name)
{var reg= new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
var r=window.location.search.substr(1).match(reg);
if(r!=null)
return unescape(r[2]);
return ""; 
}
