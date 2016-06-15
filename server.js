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
var platform = web3.eth.contract([{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"money","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"Center","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"person1","type":"address"},{"name":"person2","type":"address"},{"name":"stock","type":"uint256"},{"name":"money","type":"uint256"}],"name":"jieya","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"person1","type":"address"},{"name":"person2","type":"address"},{"name":"stock","type":"uint256"},{"name":"money","type":"uint256"}],"name":"zhiya","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"shareholder","type":"address"}],"name":"getStock","outputs":[{"name":"all","type":"uint256"},{"name":"frozen","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"sender","type":"address"},{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"fundsTx","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"person1","type":"address"},{"name":"person2","type":"address"},{"name":"amount","type":"uint256"},{"name":"price","type":"uint256"}],"name":"transfer","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"sender","type":"address"},{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"stockTx","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"shareholder","type":"address"},{"name":"amount","type":"uint256"}],"name":"register","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"person","type":"address"},{"name":"amount","type":"uint256"}],"name":"modify","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"all","type":"uint256"},{"name":"frozen","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"shareholder","type":"address"},{"name":"amount","type":"uint256"}],"name":"freeze","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"center","type":"address"},{"name":"company","type":"uint256"},{"name":"shareholder","type":"address"},{"name":"amount","type":"uint256"}],"name":"unfreeze","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"person","type":"address"}],"name":"getFunds","outputs":[{"name":"amount","type":"uint256"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"info","type":"string"}],"name":"writelog","type":"event"}]).at("0xb6e197aae39fb3be56dfadb5bc65a699eb19d14b") ;

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

//点击冻结股份,至个人解冻申请页面
app.get('/applyUnfreeze', function(req, res){
	var addrPerson =  req.query.addr  || '';
	var company =  req.query.compId || '';
	var passdata = {};

	connection.query('select * from person_info, company_info,zhiya,center_company where zhiya.addrZhiya=person_info.addr and zhiya.company=company_info.addr and  company_info.addr=center_company.addrCompany   and zhiya.status=? and zhiya.addrZhiya=? and zhiya.company=? ',['N',addrPerson,company],function(err,result){
		if(err){
			console.log('[error]select:',err.message);
			return ;
		}
		if(result.length==0)
		{
			console.log('[error]查询不到冻结合约信息');
			return ;
		}
		passdata['company']=result[0].quancheng;
		passdata['person']=result[0].name;
		passdata['zhengjian']=result[0].zhengjian;
		passdata['shouji']=result[0].zhouji;
		passdata['freezeType']=result[0].type;
		passdata['deadline']=result[0].deadline;
		passdata['liyou']=result[0].liyou;
		var balance = platform.getStock.call(result[0].addrCenter,company,addrPerson);
		passdata['stock']=balance[0];	
		passdata['frozen1']=balance[1];
		var dateNow = new Date();
		passdata['timeleft']=parseInt((result[0].deadline.getTime()-dateNow.getTime())/1000);
		passdata['frozen2']=result[0].shuliang;
		res.render('applyUnfreeze',passdata);
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


//质押
app.get('/zhiya', function(req, res){
    res.render('zhiya');
});
//由填入的地址显示质押方信息
app.post('/showPerson1', function(req, res){
	var addrCenter = req.query.addr || '';
	var addrPerson = req.body.address1  || '';
	var person2 = req.body.address2  || '';
	if(addrPerson==person2)
		return res.send({result:"质押方与受押方不能相同",name:"",zhengjianhao:"",shoujihao:""});
   	connection.query('select * from person_info where addr = ?',[addrPerson],function(err,result){
		if(err){
		     console.log('[error]select:',err.message);
		     return ;
		}
		if(result.length!=0)
			res.send({result:"",name:result[0].name,zhengjianhao:result[0].zhengjian,shoujihao:result[0].shouji});
		else
			res.send({result:"非用户地址",name:"",zhengjianhao:"",shoujihao:""});
	});
});
//由填入的地址显示受押方信息
app.post('/showPerson2', function(req, res){
	var addrCenter = req.query.addr || '';
	var addrPerson = req.body.address2  || '';
	var person1 = req.body.address1  || '';
	if(person1==addrPerson)
		return res.send({result:"质押方与受押方不能相同",name:"",zhengjianhao:"",shoujihao:"",money:""});
   	connection.query('select * from person_info where addr = ?',[addrPerson],function(err,result){
		if(err){
		     console.log('[error]select:',err.message);
		     return ;
		}
		if(result.length!=0)
			res.send({result:"",name:result[0].name,zhengjianhao:result[0].zhengjian,shoujihao:result[0].shouji,money:platform.getFunds.call(addrPerson)});
		else
			res.send({result:"非用户地址",name:"",zhengjianhao:"",shoujihao:"",money:""});
	});
});
//由填入的公司名称和质押方显示公司和持股信息
app.post('/showComp', function(req, res){
	var addrCenter = req.query.addr || '';
	var addrPerson = req.body.address1  || '';
	var quancheng = req.body.company  || '';
	connection.query('select * from person_info where addr = ?',[addrPerson],function(err,result){
		if(err){
		     console.log('[error]select:',err.message);
		     return ;
		}
		if(result.length==0)
		{	
			return res.send({result:"用户地址不合法"});
		}
		else
		{
			var namePerson = result[0].name ;
		   	connection.query('select * from company_info where quancheng = ?',[quancheng],function(err,result){
				if(err){
				     console.log('[error]select:',err.message);
				     return ;
				}
				if(result.length!=0)
				{
					var balance = platform.getStock.call(addrCenter,result[0].addr,addrPerson);
					res.send({result:"",stock:balance[0],frozen:balance[1],name:namePerson,compId:result[0].addr});
				}
				else
				{
					res.send({result:"公司名称不存在",stock:"",frozen:"",name:"",compId:""});
				}
			});
		}
	});
});
//确认冻结
app.post('/freeze', function(req, res){
	var addrCenter = req.query.addr || '';
	var addrPerson1 = req.body.address1  || '';
	var addrPerson2 = req.body.address2  || '';
	var addrComp = req.query.compId || '';
	var money = platform.getFunds.call(addrPerson2);
	var stock = platform.getStock.call(addrCenter,addrComp,addrPerson1);
	var tofreeze = req.body.tofreeze  ;
	var pay = req.body.pay ;
	if(pay>=money)
		return res.send("受押方金额不足,请充值");
	if(tofreeze>=stock[0]-stock[1])
		return res.send("质押方可冻结股份不足");
	var deadline = req.body.deadline  ;
	var freezeType = req.body.freezeType  ;
	var liyou = req.body.liyou  ;

	var txhash = platform.zhiya.sendTransaction(addrCenter,addrComp,addrPerson1,addrPerson2,tofreeze,pay,{from: web3.eth.accounts[0]}) ;
	console.log('质押成交txhash:'+txhash);
	connection.query( 'insert into zhiya(addrZhiya,addrShouya,company,shuliang,jiage,deadline,type,liyou,platform,status,txhash1,txhash2)values(?,?,?,?,?,?,?,?,?,?,?,?)',[addrPerson1,addrPerson2,addrComp,tofreeze,pay,deadline,freezeType,liyou,'N','N',txhash,''],function(err,result){
		if(err){
			console.log('[error]insert-',err.message);
			return res.send("提交失败");
		}
		res.end();
	});


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
	//查询本股交中心的受让申请
	var addrCenter = req.query.addr  || '';
	connection.query('select quancheng,name,transfer.shuliang as Ashuliang,jiage,transfer.id as Aid from transfer,transfer_app,center_company,company_info,person_info  where transfer.idapp=transfer_app.id and transfer_app.company=center_company.addrCompany and transfer_app.company=company_info.addr and transfer.addrIn=person_info.addr and addrCenter = ?',[addrCenter],function(err,result){
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
			passdata['shuliang'+i] = result[i].Ashuliang;
			passdata['zijin'+i] = result[i].Ashuliang * result[i].jiage;
			passdata['app'+i] = result[i].Aid;
		}
		res.render('shourang',passdata);
   	 });
});
//受让详情
app.get('/shourangDetail', function(req, res){
	//查询本股交中心的申请
	var addrCenter = req.query.addr  || '';
	var appId = req.query.app  || '';

	connection.query('select person_info1.name as name1, person_info2.name as name2 ,person_info1.zhengjian as zhengjian1, person_info2.zhengjian as zhengjian2,quancheng,addrCenter,addrCompany,addrOut,addrIn,jiage,liyou,transfer_app.shuliang as shuliang1,transfer.shuliang as shuliang2 from transfer,transfer_app,person_info as person_info1,person_info as person_info2 ,company_info ,center_company where  transfer.idapp=transfer_app.id and transfer.addrIn=person_info2.addr and transfer_app.addrOut=person_info1.addr and transfer_app.company=company_info.addr and transfer_app.company=center_company.addrCompany and transfer.id = ?',[appId],function(err,result){
		if(err){
			console.log('[select error]-',err.message);
			return ;
		}
		var passdata = {};
		passdata['xingming1']=result[0].name1;
		passdata['zhengjianhao1']=result[0].zhengjian1;
		passdata['qiye']=result[0].quancheng;
		var stock = platform.getStock.call(result[0].addrCenter,result[0].addrCompany,result[0].addrOut) ;
		passdata['stock'] = stock[0];
		passdata['frozen'] = stock[1];
		passdata['shuliang1'] = result[0].shuliang1;
		passdata['jiage']=result[0].jiage;
		passdata['liyou']=result[0].liyou;
		passdata['xingming2']=result[0].name2;
		passdata['zhengjianhao2']=result[0].zhengjian2;
		passdata['shuliang2']= result[0].shuliang2;
		passdata['zonge'] = result[0].shuliang2 * result[0].jiage;
		passdata['zijin'] = platform.getFunds.call(result[0].addrIn) ;

		res.render('shourangDetail',passdata);
   	 });
});
//批准或驳回受让申请
app.post('/changeStatus2', function(req, res){
	var appId = req.query.app  || '';
	var status = req.body.result  || '';

	connection.query('select status from transfer where id = ?',[appId],function(err,result){
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
		if (status=='A')
		{
			connection.query('select addrCenter, company,addrIn,addrOut,jiage ,transfer.shuliang as Ashuliang from transfer, transfer_app , center_company where  transfer.idapp=transfer_app.id and transfer_app.company=center_company.addrCompany and transfer.id=?',[appId],function(err,result){
				if(err){
					console.log('[select error]-',err.message);
					return ;
				}
				var txhash = platform.transfer.sendTransaction(result[0].addrCenter,result[0].company,result[0].addrOut,result[0].addrIn,result[0].Ashuliang,result[0].jiage,{from: web3.eth.accounts[0]}) ;
				console.log('转让成交txhash:'+txhash);
				connection.query('update transfer set status = ?,txhash=? where id =?',[status,txhash,appId],function(err,result){
					if(err){
						console.log('[update error]-',err.message);
						return res.send("提交失败");
					}
					res.end();
				});
			
			});
		}
		else if(status=='R')
		{
			connection.query('update transfer set status = ? where id =?',[status,appId],function(err,result){
				if(err){
					console.log('[update error]-',err.message);
					return res.send("提交失败");
				}
				res.end();
			});
		}
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
	if (zonge > platform.getFunds.call(addrPerson) )
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


