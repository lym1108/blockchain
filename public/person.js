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


