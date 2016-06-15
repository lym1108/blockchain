window.onload = function() {


	$("#goback").click(function() {
		 window.location.href="/zhuanrangGD?addr="+GetQueryString("addr");
	});
	$("#personCenter").click(function() {
		 window.location.href="/person?addr="+GetQueryString("addr")+"&app="+GetQueryString("app");
	});

	
};

function GetQueryString(name)
{var reg= new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
var r=window.location.search.substr(1).match(reg);
if(r!=null)
return unescape(r[2]);
return ""; 
}
function compute(){
	document.getElementById("total_app").value = $("#shuliang_app").val() * $("#jiage").text();
}
function fsubmit(){
	if($("#shuliang_app").val()=='')
			$(sbmResult).html("请填申请数量");
		else if($("#shuliang_app").val()>$("#shuliang").text())
			$(sbmResult).html("申请数量不得大于转让数量");
		else{
			 $.ajax({
				url:'/sbmShourang?addr='+GetQueryString("addr")+"&app="+GetQueryString("app"),
				type:"post",
				dataType : "text",
				data:{shuliang_app:$("#shuliang_app").val(),total_app:$("#total_app").val()},
				error:function(XMLHttpRequest,textStatus,errorThrown){
					alert(XMLHttpRequest.status);
					alert(XMLHttpRequest.readyState);
					alert(textStatus);
				},
				success:function(data){
					if(data)
						$(sbmResult).html(data);
					else
						window.location.href="/zhuanrangGD?addr="+GetQueryString("addr");
				}
			});
		}
}
