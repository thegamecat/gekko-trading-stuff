# gekko-trading-stuff
A dumping ground for my files I use with this awesome crypto currency trading platform https://github.com/askmike/gekko

******************************************************************************************************************************
Indicators:
Place the indicators into the Strategies / Indicators folder then reference them inside your strategy. 

TWIG.js
This is a TWIGs indicator based on https://www.incrediblecharts.com/indicators/twiggs_money_flow.php

FIBO.js
This is a fibonnaci retracement indicator that works out the fib levels. 

******************************************************************************************************************************


Writing CSV of strat output candles

Install fs

Add this to the top of the strat:
var fsw = require('fs');



Add this in .update under your logic etc I've used adx as an example:

  grreadtime = candle.start.toDate();
  headertxt = "date,price,adx,buys (USD),sells (BTC)\n";
  outtxt = grreadtime+","+ price+","+adxresult+","+buytime+","+selltime+"\n";

  if(headerset==""){
    fsw.appendFileSync(this.fname, headertxt, encoding='utf8');
    headerset = "1";
  }

  fsw.appendFileSync(this.fname, outtxt, encoding='utf8');
  outtxt = "";
  
  ******************************************************************************************************************************
  
  Running Gekko in Bash on Windows 10
  
  SQLite wont work with Pragma WAL so open the db with DB Browser for SQLite and change the db Pragma to DEL or OFF.
  Then in F:\bash\gekko052\gekko\plugins\sqlite\handle.js change WAL to DEL (line 53).
  
  ******************************************************************************************************************************
  
  Having memory issues?
  
  Use  node --max-old-space-size=8192 server.js which gives node 8gig to play with rather than 1.5 which sucks. 
