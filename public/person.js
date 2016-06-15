window.onload = function() {



        $("#goback").click(function() {

				  window.location.href="/?addr="+GetQueryString("addr");

	});

	
};

function GetQueryString(name)
{var reg= new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
var r=window.location.search.substr(1).match(reg);
if(r!=null)
return unescape(r[2]);
return ""; 
}

function ftransfer(compId){
	if(compId!='')
	window.location.href="/applyTransfer?addr="+GetQueryString("addr")+"&compId="+compId;
}
function funfreeze(compId,frozen){
	if(frozen!=0 && compId!='')
	window.location.href="/applyUnfreeze?addr="+GetQueryString("addr")+"&compId="+compId;
}


function fmodify(type){
	var number = $("#shuliang").val();
	if(type =='-')
		number = -1*number ;
	if(number==0)
	{
		$(sbmResult).html("请填入充值或提现数量");
		return;
	}
	 $.ajax({
		url:'/money?addr='+GetQueryString("addr")+"&app="+GetQueryString("app"),
		type:"post",
		dataType : "text",
		data:{shuliang:number},
		error:function(XMLHttpRequest,textStatus,errorThrown){
			alert(XMLHttpRequest.status);
			alert(XMLHttpRequest.readyState);
			alert(textStatus);
		},
		success:function(data){
			if(data)
				$(sbmResult).html(data);
		}
	});
}


