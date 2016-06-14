window.onload = function() {
        
};

function GetQueryString(name)
{var reg= new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
var r=window.location.search.substr(1).match(reg);
if(r!=null)
return unescape(r[2]);
return ""; 
}
function fshow1(){
		if($("#address1").val()==''){
			$(result1).html('请填入质押方地址');
			return;
		}
		$.ajax({
			url:'/showPerson1?addr='+GetQueryString("addr"),
			type:"post",
			dataType : "json",
			data:$('form').serialize(),
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
				$(name1).html(data.name);
				$(zhengjianhao1).html(data.zhengjianhao);
				$(shoujihao1).html(data.shoujihao);
				$(result1).html(data.result);
			}
		});
}

function fshow2(){
		if($("#address2").val()==''){
			$(result2).html('请填入受押方地址');
			return;
		}
		$.ajax({
			url:'/showPerson2?addr='+GetQueryString("addr"),
			type:"post",
			dataType : "json",
			data:$('form').serialize(),
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
				$(name2).html(data.name);
				$(zhengjianhao2).html(data.zhengjianhao);
				$(shoujihao2).html(data.shoujihao);
				$(result2).html(data.result);
				$(money).html(data.money);
			}
		});
}

function fshowComp(){
		if($("#company").val()==''){
			$(result0).html('请填入公司名称');
			return;
		}else if($("#address1").val()==''){
			$(result0).html('请填入质押方地址');
			return;
		}
		$.ajax({
			url:'/showComp?addr='+GetQueryString("addr"),
			type:"post",
			dataType : "json",
			data:$('form').serialize(),
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
				$(name0).html(data.name);
				$(stock).html(data.stock);
				$(frozen).html(data.frozen);
				$(result0).html(data.result);
			}
		});
}

function fsubmit(){
		if($("#name0").text()==''){
			$(result4).html('请填入公司名称');
			return;
		}else if($("#name1").text()==''){
			$(result4).html('请填入质押方地址');
			return;
		}else if($("#name2").text()==''){
			$(result4).html('请填入受押方地址');
			return;
		}
		$.ajax({
			url:'/freeze?addr='+GetQueryString("addr"),
			type:"post",
			data:$('form').serialize(),
			error:function(XMLHttpRequest,textStatus,errorThrown){
				alert(XMLHttpRequest.status);
				alert(XMLHttpRequest.readyState);
				alert(textStatus);
			},
			success:function(data){
				if(data)
					$(result4).html(data);
				else
					window.location.href="/center?addr="+GetQueryString("addr");
			}
		});
}

function fcancel(){

	 window.location.href="/center?addr="+GetQueryString("addr");
	
}

