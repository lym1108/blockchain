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
function fregcompany(){
		if($("#quancheng").val()==''){
			$(sbmCompResult).html('请填入公司全称');
			return;
			}
		$.ajax({
			url:'/regCompany?addr='+GetQueryString("addr"),
			type:"post",
			dataType : "text",
			data:$('form').serialize(),
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
				$(sbmCompResult).html(data);
			}
		});
}

function fregperson(){
		if($("#sbmCompResult").text()!='登记成功'){
			$(sbmPersonResult).html('请先进行企业登记');
			return;
		}
		$.ajax({
			url:'/regPerson?addrCenter='+GetQueryString("addr"),
			type:"get",
			dataType : "text",
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
				$(sbmPersonResult).html(data);
			}
		});
}

function fview(){
if($("#sbmCompResult").text()!='登记成功'){
$(viewResult).html('请先进行企业登记');
return;
}else if($("#sbmPersonResult").text()!='已提交')
{$(viewResult).html('请先提交股东登记');
return;
}
$.ajax({
			url:'/viewRegPerson?addrCenter='+GetQueryString("addr"),
			type:"get",
			dataType : "text",
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
				$(viewResult).html(data);
			}
		});
}

