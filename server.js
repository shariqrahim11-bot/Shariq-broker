const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let DB = { balance: 0, trades: [], deposits: [] };
let PRICES = { "EURUSD": 1.0852, "GBPUSD": 1.2710, "BTCUSD": 85819, "ETHUSD": 3020, "AAPL": 210.5, "TSLA": 250.3, "NVDA": 880.1 };

// Prices har 3 sec me thoda up/down (MT5 jaisa live)
setInterval(()=>{
  for(let s in PRICES){ PRICES[s] += (Math.random()-0.5)*0.001*PRICES[s]; }
}, 3000);

app.get('/api/prices', (req,res)=> res.json(PRICES));
app.get('/api/me', (req,res)=> res.json(DB));

app.post('/api/deposit', (req,res)=>{
  DB.balance += 1000;
  DB.deposits.push({amount:1000, status:"PENDING - Easypaisa Check", time: new Date().toLocaleString()});
  res.json(DB);
});

app.post('/api/withdraw', (req,res)=>{
  if(DB.balance >= 500){
    DB.balance -= 500;
    res.json({ok:true, msg:"Withdraw 500 PKR Request Sent! 24h me Easypaisa pe ayega",...DB});
  } else {
    res.json({ok:false, msg:"Balance kam hai, min 500 PKR chahiye"});
  }
});

app.post('/api/trade', (req,res)=>{
  const {symbol, lot, type} = req.body;
  let price = PRICES[symbol];
  let margin = price * lot * 10; // 0.01 lot logic
  if(type === 'BUY' && DB.balance >= margin){
    DB.balance -= margin;
    DB.trades.push({symbol, lot, price, type, time: new Date().toLocaleTimeString()});
    res.json({ok:true,...DB});
  } else if(type === 'SELL'){
    DB.balance += margin;
    DB.trades.push({symbol, lot, price, type, time: new Date().toLocaleTimeString()});
    res.json({ok:true,...DB});
  } else {
    res.json({ok:false, msg:"Balance kam hai"});
  }
});

app.listen(8000, ()=> console.log("SHARIQ BROKER LIVE 8000"));
