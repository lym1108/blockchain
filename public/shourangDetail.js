window.onload = function() {
  $("#goback").click(function() {

		 window.location.href="/shourang?addr="+GetQueryString("addr");

	});
};

function GetQueryString(name)
{var reg= new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
var r=window.location.search.substr(1).match(reg);
if(r!=null)
return unescape(r[2]);
return ""; 
}
function changeStatus(status){
	$.ajax({
		url:'/changeStatus2?addr='+GetQueryString("addr")+"&app="+GetQueryString("app"),
		type:"post",
		dataType : "text",
		data:{result:status},
		error:function(XMLHttpRequest,textStatus,errorThrown){
			alert(XMLHttpRequest.status);
			alert(XMLHttpRequest.readyState);
			alert(textStatus);
		},
		success:function(data){
			if(data)
				$(sbmResult).html(data);
			else
				window.location.href="/shourang?addr="+GetQueryString("addr");
		}
	});
}



