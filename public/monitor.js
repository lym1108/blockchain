window.onload = function() {
        
};

function GetQueryString(name)
{var reg= new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
var r=window.location.search.substr(1).match(reg);
if(r!=null)
return unescape(r[2]);
return ""; 
}
function fmonitor(num){
		$(message).html('querying...');
		$.ajax({
			url:'/monitor'+num+'?addr='+GetQueryString("addr"),
			type:"get",
			dataType : "text",
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
				$(message).html(data);
			}
		});
}


