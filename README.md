# gekko-trading-stuff
A dumping ground for my files I use with this awesome crypto currency trading platform https://github.com/askmike/gekko


Run-ga.js

Run server.js, run-ga.js is going to connect to this via posts.

Then run run-ga.js.

Inside you will need to set up the strat, the config section and...var properites is where you set up the genes.


Writing CSV of strat output candles

Install fs

Add this to the top of the strat:
var fsw = require('fs');



Add this in .check under your logic etc I've used adx as an example:

  grreadtime = this.candle.start._d;
  headertxt = "date,price,adx,buys (USD),sells (BTC)\n";
  outtxt = grreadtime+","+ price+","+adxresult+","+buytime+","+selltime+"\n";

  if(headerset==""){
    fsw.appendFileSync(this.fname, headertxt, encoding='utf8');
    headerset = "1";
  }

  fsw.appendFileSync(this.fname, outtxt, encoding='utf8');
  outtxt = "";
