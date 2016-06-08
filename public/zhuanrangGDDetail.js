window.onload = function() {

	$("#goback").click(function() {
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
				data:$('form').serialize(),
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
