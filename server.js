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
		passdata['zijin']=platform.getFunds.call(addrPerson) ;
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
				passdata['comp'+i] = result[i].compAddr;
				var stock = platform.getStock.call(result[i].centerAddr,result[i].compAddr,addrPerson) ;
				passdata['stock'+i] = stock[0];
				passdata['frozen'+i] = stock[1];

			}
			res.render('person',passdata);
		});
		 
   	 });

 	
});
//点击充值或提现
app.post('/money', function(req, res){
	var addrPerson =  req.query.addr  || '';
	var shuliang =  req.body.shuliang;
    	//提交至区块链
	var txhash = platform.modify.sendTransaction(addrPerson,shuliang,{from: web3.eth.accounts[0]}) ;
	console.log('资金充值提现txhash:'+txhash);
	res.send("已提交"); 
});
//点击转让,至个人股权转让申请页面
app.get('/applyTransfer', function(req, res){
    res.render('applyTransfer');
});
//个人股权转让申请点击提交
app.post('/sbmApplyTransfer', function(req, res){
	var addrOut =  req.query.addr  || '';
	var company =  req.query.compId || '';
	var shuliang =  req.body.shuliang  ;
	var jiage =  req.body.jiage  ;
	var liyou = req.body.liyou  || '';
	//插入转让申请表
	connection.query( 'insert into transfer_app(addrOut,company,shuliang,jiage,liyou,platform,status)values(?,?,?,?,?,?,?)',[addrOut,company,shuliang,jiage,liyou,'N','N'],function(err,result){
   		if(err){
		     console.log('[error]转让申请插入transfer_app:',err.message);
		     res.send('插入数据库失败');
		     return ;
		}
		console.log('股权转让申请提交成功');res.send({});
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
//股权中心首页点击转让申请列表
app.get('/zhuanrang', function(req, res){
	//查询本股交中心的申请
	var addrCenter = req.query.addr  || '';
	connection.query('select * from transfer_app,center_company,company_info,person_info where transfer_app.company=center_company.addrCompany and transfer_app.company=company_info.addr and transfer_app.addrOut=person_info.addr and addrCenter = ?',[addrCenter],function(err,result){
		if(err){
			console.log('[select error]-',err.message);
			return ;
		}
		var passdata = {};
		for(var i=0;i<result.length;i++)
		{
			if(i>=3)
				break;
			passdata['company'+i]=result[i].quancheng;
			passdata['applicant'+i]=result[i].name;
			passdata['shuliang'+i] = result[i].shuliang;
			var stock = platform.getStock.call(result[i].addrCenter,result[i].addrCompany,result[i].addrOut) ;
			passdata['stock'+i] = stock[0];
			passdata['app'+i] = result[i].id;
		}
		res.render('zhuanrang',passdata);
   	 });
});
//转让详情
app.get('/zhuanrangDetail', function(req, res){
	//查询本股交中心的申请
	var addrCenter = req.query.addr  || '';
	var appId = req.query.app  || '';
	connection.query('select * from transfer_app,center_company,company_info,person_info where transfer_app.company=center_company.addrCompany and transfer_app.company=company_info.addr and transfer_app.addrOut=person_info.addr and id = ?',[appId],function(err,result){
		if(err){
			console.log('[select error]-',err.message);
			return ;
		}
		var passdata = {};
		passdata['xingming']=result[0].name;
		passdata['zhengjianhao']=result[0].zhengjian;
		passdata['qiye']=result[0].quancheng;
		var stock = platform.getStock.call(result[0].addrCenter,result[0].addrCompany,result[0].addrOut) ;
		passdata['stock'] = stock[0];
		passdata['frozen'] = stock[1];
		passdata['shuliang'] = result[0].shuliang;
		passdata['jiage']=result[0].jiage;
		passdata['liyou']=result[0].liyou;
		res.render('zhuanrangDetail',passdata);
   	 });
});
//批准或驳回转让申请
app.post('/changeStatus', function(req, res){
	var appId = req.query.app  || '';
	var status = req.body.result  || '';
	var platform = req.body.shanlian || '';
	connection.query('select status from transfer_app where id = ?',[appId],function(err,result){
		if(err){
			console.log('[select error]-',err.message);
			return ;
		}
		if (result[0].status=='R')
			return res.send("已驳回");
		else if(result[0].status=='A')
			return res.send("已批准");
		else if(result[0].status=='F')
			return res.send("已完结");
		connection.query('update transfer_app set platform = ?, status = ? where id =?',[platform,status,appId],function(err,result){
			if(err){
				console.log('[update error]-',err.message);
				res.send("提交失败");
				return ;
			}
			res.end();
		});
	});
});
//股权中心首页点击受让申请列表
app.get('/shourang', function(req, res){
	res.render('shourang');
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
//用户在股权中心首页点击转让申请列表
app.get('/zhuanrangGD', function(req, res){
	//查询本股交中心的申请
	var addrPerson = req.query.addr  || '';
	connection.query('select * from transfer_app,center_company,company_info,center_info where transfer_app.company=center_company.addrCompany and transfer_app.company=company_info.addr and center_company.addrCenter=center_info.addr and status = ? and  (platform =? or addrCenter = ?)',['A','Y','0x3fd482195ebe1dc2c5a263a01fc92e38f60bd499'],function(err,result){
		if(err){
			console.log('[select error]-',err.message);
			return ;
		}
		var passdata = {};
		for(var i=0;i<result.length;i++)
		{
			if(i>=3)
				break;
			passdata['app'+i] = result[i].id;
			passdata['center'+i] = result[i].name;
			passdata['company'+i]=result[i].quancheng;
			passdata['shuliang'+i] = result[i].shuliang;
			passdata['jiage'+i] = result[i].shuliang;			
		}
		res.render('zhuanrangGD',passdata);
   	 });
});
//转让详情
app.get('/zhuanrangGDDetail', function(req, res){
	//查询本股交中心的申请
	var addrCenter = req.query.addr  || '';
	var appId = req.query.app  || '';
	connection.query('select * from transfer_app,company_info where transfer_app.company=company_info.addr and id = ?',[appId],function(err,result){
		if(err){
			console.log('[select error]-',err.message);
			return ;
		}
		var passdata = {};
		passdata['company'] = result[0].quancheng;
		passdata['shuliang'] = result[0].shuliang;
		passdata['jiage']=result[0].jiage;
		passdata['total']=result[0].jiage*result[0].shuliang;
		res.render('zhuanrangGDDetail',passdata);
   	 });
});
//提交受让申请
app.post('/sbmShourang', function(req, res){
	var addrPerson = req.query.addr  || '';
	var appId = req.query.app  || '';
	var shuliang = req.body.shuliang_app  || '';
	var zonge = req.body.total_app  || '';
	if (zonge >0)
		return res.send('资金余额不足,请到个人中心充值');
	//插入受让申请表
	connection.query( 'insert into transfer(idapp,addrIn,shuliang,status,txhash)values(?,?,?,?,?)',[appId,addrPerson,shuliang,'N',''],function(err,result){
   		if(err){
		     console.log('[error]受让申请插入transfer:',err.message);
		     res.send('插入数据库失败');
		     return ;
		}
		console.log('股权受让申请提交成功');res.end();
	}); 
});





app.listen(1337, function(){
   console.log('FlashChain DApp listening on port 1337!');
});


