var express = require('express');
var app = express();
var fs = require('fs');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var solc = require('solc');
var hbs = require('hbs');
var bodyParser = require('body-parser');



app.set('views',__dirname +'/views');
app.set('view engine','html');
app.engine('html',hbs.__express);
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));



//******************************************
var mysql = require('mysql');
var connection = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'',
  database:'flash_db'
});

connection.connect(function(err){
  if(err){
    console.error('error connecting: '+err.stack);
    return ;
  }
  console.log('Mysql connected as id'+connection.threadId);
});
//******************************************




//全局变量
var platform = web3.eth.contract([{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"money","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"Center","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"shareholder","type":"address"}],"name":"getStock","outputs":[{"name":"all","type":"uint256"},{"name":"frozen","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"sender","type":"address"},{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"fundsTx","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"person1","type":"address"},{"name":"person2","type":"address"},{"name":"amount","type":"uint256"},{"name":"price","type":"uint256"}],"name":"transfer","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"sender","type":"address"},{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"stockTx","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"shareholder","type":"address"},{"name":"amount","type":"uint256"}],"name":"register","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"person","type":"address"},{"name":"amount","type":"uint256"}],"name":"modify","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"all","type":"uint256"},{"name":"frozen","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"shareholder","type":"address"},{"name":"amount","type":"uint256"}],"name":"freeze","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"shareholder","type":"address"},{"name":"amount","type":"uint256"}],"name":"unfreeze","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"person","type":"address"}],"name":"getFunds","outputs":[{"name":"amount","type":"uint256"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"info","type":"string"}],"name":"writelog","type":"event"}]).at("0x1d2e4ab7aa01569446b9c8da78a25d47ff00f24d") ;

platform.writelog().watch(function(error,result){
	if(error)
		console.log(error); 
	else
	{
		console.log(result.transactionHash+':'+result.args.info);
		var insertstr = 'insert into tx_event_status(tx_hash,event,result) values (?,?,?)';
		var insertParams = [result.transactionHash,result.event,result.args.info];
		connection.query(insertstr,insertParams,function(err,result){
		  if(err){
		     console.log('[error]插入tx_event_status:',err.message);
		     return ;
		  }
		  
		});

	}
});


//主页
app.get('/', function(req, res){
    var addr = req.query.addr  || '';
    if(addr=='')
       res.render('index',{logonStatus:"未登录"});
    else
       res.render('index',{logonStatus:"已登录"});
});
//登录页面
app.get('/logon', function(req, res){
    res.render('logon');
});
//某地股权中心主页
app.get('/center', function(req, res){
    var addr = req.query.addr  || '';
    if(addr=='')
       res.render('center',{logonStatus:"未登录"});
    else
       res.render('center',{logonStatus:"已登录"});
});
//点击个人中心按钮
app.get('/toperson', function(req, res){
	var addrPerson = req.query.addr  || '';
	connection.query('select addr from person_info where addr = ?',[addrPerson],function(err,result){
		if(err){
		     console.log('[select error]-',err.message);
		     return ;
		}
		if(result.length==0)
			return res.send("非股东用户,无权限进入");
		else
			res.end();
});
});
//显示查询出的持股数量
app.get('/person', function(req, res){
	var addrPerson = req.query.addr  || '';
	var passdata = {};
	connection.query('select name from person_info where addr = ?',[addrPerson],function(err,result){
		if(err){
			console.log('[select error]-',err.message);
			return ;
		}
		passdata['person']=result[0]['name'];
		connection.query('select center_info.name as centerName,center_info.addr as centerAddr, company_info.quancheng as compName,company_info.addr as compAddr from center_company,company_person,center_info,company_info where center_company.addrCompany=company_person.addrCompany and center_company.addrCompany=company_info.addr and center_company.addrCenter=center_info.addr and addrPerson = ?',[addrPerson],function(err,result){
			if(err){
			console.log('[select error]-',err.message);
			return ;
			}
		
			for(var i=0;i<result.length;i++)
			{
				if(i>=3)
					break;
				passdata['center'+i]=result[i].centerName;
				passdata['company'+i]=result[i].compName;
				var stock = platform.getStock.call(result[i].centerAddr,result[i].compAddr,addrPerson) ;
				passdata['stock'+i] = stock[0];
				passdata['frozen'+i] = stock[1];
			}
			res.render('person',passdata);
		});
		 
   	 });

 	
});
//托管登记
app.get('/register', function(req, res){
    res.render('register');
});
//企业登记的提交
app.post('/regCompany', function(req, res){
	var centerAaddr = req.query.addr  || '';
	var quancheng = req.body.quancheng  || '';
	var jiancheng =  '';
	var yingwen =  '';
	var zhucedizhi =  '';
	var hangyeleibie =  '';
	var hangyedaima =  '';
	var zhucehao =  '';
	var faren =  '';
	var farenhao = '';
	var mianzhi =  '';
	var zongguben =  '';
	var shijian = '';
	var mima = '';
        //插入公司信息表
	connection.query( 'insert into company_info (secret,quancheng,jiancheng,yingwen,zhucedizhi,hangyeleibie,hangyedaima,zhucehao,faren,farenhao,mianzhi,zongguben,shijian) values (?,?,?,?,?,?,?,?,?,?,?,?,?)',
[mima,quancheng,jiancheng,yingwen,zhucedizhi,hangyeleibie,hangyedaima,zhucehao,faren,farenhao,mianzhi,zongguben,shijian],function(err,result){
		if(err){
		     console.log('[error]企业登记插入company_info:',err.message);
		     res.send('插入数据库失败');
		     return ;
		}
		connection.query('select max(addr) from company_info',function(err,result){
			if(err){
			     console.log('[error]select max(addr):',err.message);
			     return ;
			}
			var companyAddr = result[0]['max(addr)'];
			//插入股交中心公司表
			connection.query( 'insert into center_company(addrCenter, addrCompany) values (?,?)',[centerAaddr,companyAddr],function(err,result){
				if(err){
				     console.log('[error]企业登记插入center_company:',err.message);
				     res.send('插入数据库失败');
				     return ;
			  	}
				console.log(quancheng+'-企业登记成功');res.send({result:"登记成功",compAddr:companyAddr});
			});  	
		});
	});
});
//企业登记股东的提交
app.get('/regPerson', function(req, res){
	var addrCenter = req.query.addrCenter  || '';
	var addrComp = req.query.addrComp  || '';
	var gudong = ['0x2c5a943989fb0aeda84dfc422f080ee38f948cec','0xacd20bb63c3206bcd97f20b596fdea76eb0b6a4d','0xed45a908358a24a61f6ff59a729ca0e005338227','0xfa8a7c6e3a4172f6948231b4536d9a1e3d3c2472'] ; //hardcode
	var shuliang = [1000,2000,3000,5000];  //hardcode
	for(var i=0;i<gudong.length;i++){
		//提交至区块链
		var txhash = platform.register.sendTransaction(addrCenter,addrComp,gudong[i], shuliang[i],{from: web3.eth.accounts[0]}) ;
		console.log('股东登记第'+(i+1)+'条txhash:'+txhash);
		//插入公司股东表
		connection.query( 'insert into company_person (addrCompany,addrPerson) values (?,?)',[addrComp,gudong[i]],function(err,result){
		  	if(err){
			     console.log('[error]股东登记插入company_person:',err.message);
			     return res.send('插入数据库失败');
			}
			
		});
		console.log('股东登记:正插入数据库第'+(i+1)+'条');
	}
	res.send("已提交");     
});

//***********************************************************股交中心************************************************


//股交中心登录
app.get('/a/logon', function(req, res){
    var addr = req.query.addr  || '';
    var pw = req.query.pw  || '';
    connection.query('select addr,secret from center_info where addr = ?',[addr],function(err,result){
	  if(err){
	     console.log('[select error]-',err.message);
	     return ;
	  }
	  if(result.length==0)
		res.send("账户地址不存在");
          else if(result[0].secret != pw)
     		res.send("密码错误");
	  else
		res.end();
    });
});



//***********************************************************用户************************************************
//用户登录
app.get('/b/logon', function(req, res){
    var addr = req.query.addr  || '';
    var pw = req.query.pw  || '';
    connection.query('select addr,secret from person_info where addr = ?',[addr],function(err,result){
	  if(err){
	     console.log('[select error]-',err.message);
	     return ;
	  }
	  if(result.length==0)
		res.send("账户地址不存在");
          else if(result[0].secret != pw)
     		res.send("密码错误");
	  else
		res.end();
    });
});






app.listen(1337, function(){
   console.log('FlashChain DApp listening on port 1337!');
});


