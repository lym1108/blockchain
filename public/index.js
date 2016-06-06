window.onload = function() {



	$("#logon").click(function() {
		window.location.href="/logon?from=index&addr="+GetQueryString("addr");
	});

	$("#person").click(function() {
		if(GetQueryString("addr")=="")
			$("#logonResult1").html("请先登录");
		else{
			$.ajax({
				url:'/toperson?addr='+GetQueryString("addr"),
				type:"get",
				dataType : "text",
				error:function(XMLHttpRequest,textStatus,errorThrown){
					alert(XMLHttpRequest.status);
					alert(XMLHttpRequest.readyState);
					alert(textStatus);
				},
				success:function(data){
					if(data)
						$(logonResult1).html(data);
					else
						window.location.href="/person?addr="+GetQueryString("addr");
				}
			});
		}
	});
	$("#center").click(function() {
		window.location.href="/center?addr="+GetQueryString("addr");

	});
};

function GetQueryString(name)
{var reg= new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
var r=window.location.search.substr(1).match(reg);
if(r!=null)
return unescape(r[2]);
return ""; 
}
