window.onload = function() {



	$("#logon1").click(function() {
		$.ajax({
			url:"/a/logon",
			type:"get",
			dataType : "text",
			data:{addr:$("#centerAdrr").val(),pw:$("#centerPw").val()},
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
 				if(data)
				  $("#logon1Result").html(data);
				else if(GetQueryString("from")=="index")
				  window.location.href="/?addr="+$("#centerAdrr").val();
				else if(GetQueryString("from")=="center")
				  window.location.href="/center?addr="+$("#centerAdrr").val();
				else
				  $("#logon1Result").html("from where?");
			}
		});
	});

	$("#logon2").click(function() {
		$.ajax({
			url:"/b/logon",
			type:"get",
			dataType : "text",
			data:{addr:$("#personAdrr").val(),pw:$("#personPw").val()},
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
				if(data)
				  $("#logon2Result").html(data);
				else if(GetQueryString("from")=="index")
				  window.location.href="/?addr="+$("#personAdrr").val();
				else if(GetQueryString("from")=="center")
				  window.location.href="/center?addr="+$("#personAdrr").val();
				else
				  $("#logon2Result").html("from where");
			}
		});
	});
	 $("#goback").click(function() {
 			if(GetQueryString("from")=="index")
				window.location.href="/?addr="+GetQueryString("addr");
			else if(GetQueryString("from")=="center")
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
