window.onload = function() {
        $("#goback").click(function() {
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
function fdetail(appId){
	if(appId!='')
		window.location.href="/shourangDetail?addr="+GetQueryString("addr")+"&app="+appId;
}

