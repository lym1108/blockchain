window.onload = function() {
       

};

function GetQueryString(name)
{var reg= new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
var r=window.location.search.substr(1).match(reg);
if(r!=null)
return unescape(r[2]);
return ""; 
}
function fapplyTransfer(){
		if($("#shuliang").val()==''){
			$(sbmResult).html('请填入申请转让数量');
			return;
			}
		else if($("#jiage").val()==''){
			$(sbmResult).html('请填入申请转让价格');
			return;
			}
		$.ajax({
			url:'/sbmApplyTransfer?addr='+GetQueryString("addr")+"&compId="+GetQueryString("compId"),
			type:"post",
			dataType : "text",
			data:$('form').serialize(),
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
				window.location.href="/person?addr="+GetQueryString("addr");
			}
		});
}

function fgoback(){
 window.location.href="/person?addr="+GetQueryString("addr");
}
