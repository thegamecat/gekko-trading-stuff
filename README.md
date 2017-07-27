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
The genetic algo may not work with latest Gekko versions, key is to update the json passed:
Run-ga.js

Run server.js, run-ga.js is going to connect to this via posts.

Then run run-ga.js.

Inside you will need to set up the strat, the config section and...var properites is where you set up the genes.


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
