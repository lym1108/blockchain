window.onload = function() {



	$("#logon").click(function() {

				  window.location.href="/logon?from=center&addr="+GetQueryString("addr");

	});
        $("#goback").click(function() {

				  window.location.href="/?addr="+GetQueryString("addr");

	});
	$("#register").click(function() {

				  window.location.href="/register?addr="+GetQueryString("addr");

	});

	$("#person").click(function() {
		$.ajax({
			url:"/b/logon",
			type:"get",
			dataType : "text",
			data:{addr:$("#personAdrr").val(),pw:$("#centerPw").val()},
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
				if(data)
				  $("#logon2Result").html(data);
				else
				  window.location.href="/bindex?addr="+$("#personAdrr").val();
			}
		});
	});
	$("#center").click(function() {

				  window.location.href="/center";

	});
};

function GetQueryString(name)
{var reg= new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
var r=window.location.search.substr(1).match(reg);
if(r!=null)
return unescape(r[2]);
return ""; 
}
