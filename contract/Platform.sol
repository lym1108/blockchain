contract Platform {
  address public owner ;//合约创建者
  struct stock//股份
  {
    uint all;
    uint frozen;
  }
  mapping( address=> mapping (uint => mapping(address=>stock))) public balances;  //股权交易中心=>(公司=>(股东=>持有股份))
  mapping (address => uint) public money;  //股东=>持有金额
  event writelog(string info);

  //构造函数
  function Center() {
    owner = msg.sender ;
  }

  function getStock(address center,uint company,address shareholder) constant public returns (uint all,uint frozen)  {
    all = balances[center][company][shareholder].all;
    frozen = balances[center][company][shareholder].frozen;
    return (all,frozen);
  }
  function getFunds(address person) constant public returns (uint amount)  {
    amount = money[person];
    return amount;
  }
  //登记
  function register(address center,uint company,address shareholder,uint amount) public{
    if (balances[center][company][shareholder].all>0)
    {
      writelog("failure:已登记");
      return ;
    }
    balances[center][company][shareholder].all = amount;
    writelog("success");
  }


  //冻结
  function freeze(address center,uint company,address shareholder, uint amount) public{
    if(balances[center][company][shareholder].all-balances[center][company][shareholder].frozen < amount)
    {
      writelog("failure:可冻结股份不足");
      return ;//可冻结股份不足
    }
    balances[center][company][shareholder].frozen += amount ;
    writelog("success");
  }

  //解冻
  function unfreeze(address center,uint company,address shareholder, uint amount) public{
    if (balances[center][company][shareholder].frozen < amount)
    {
      writelog("failure:可解冻股份不足");
      return ;//可解冻股份不足
    }
    balances[center][company][shareholder].frozen -= amount ;
    writelog("success");
  }

  //交易
  function stockTx(address center,uint company,address sender, address receiver, uint amount) public returns (bool result){
    if(balances[center][company][sender].all - balances[center][company][sender].frozen < amount)
    {
      writelog("failure:可交易股份不足");
      return false;//可交易股份不足
    }
    balances[center][company][sender].all -= amount ;
    balances[center][company][receiver].all += amount ;
    writelog("success");
    return true;
  }

  //充值,取现
  function modify(address person,uint amount) public{
    if (money[person]+amount<0)
    {
      writelog("failure:资金余额不足");
      return ;
    }
    money[person] += amount;
    writelog("success");
  }


  //交易
  function fundsTx(address sender, address receiver, uint amount) public returns (bool result){
    writelog("stop5");
    if(money[sender] < amount)
    {
      writelog("failure:可交易资金不足");
      return false;
    }
    money[sender] -= amount ;
    money[receiver] += amount ;
    writelog("success");
    return true;
  }

  //转让
  function transfer(address center,uint company,address person1, address person2,  uint amount, uint price) public{
    stockTx(center,company,person1, person2, amount) ;
    fundsTx(person2, person1,  amount*price); 
 
     writelog("success");
  }

}




