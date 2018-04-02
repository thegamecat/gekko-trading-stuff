
var bullish = require('technicalindicators').bullish;
var bearish = require('technicalindicators').bearish;
var abandonedbaby = require('technicalindicators').abandonedbaby;
var bearishengulfingpattern = require('technicalindicators').bearishengulfingpattern;
var bullishengulfingpattern = require('technicalindicators').bullishengulfingpattern;
var darkcloudcover =require('technicalindicators').darkcloudcover;
var downsidetasukigap =require('technicalindicators').downsidetasukigap;
var doji =require('technicalindicators').doji;
var dragonflydoji =require('technicalindicators').dragonflydoji;
var gravestonedoji =require('technicalindicators').gravestonedoji;
var bullishharami =require('technicalindicators').bullishharami;
var bearishharamicross =require('technicalindicators').bearishharamicross;
var bullishharamicross =require('technicalindicators').bullishharamicross;
var bullishmarubozu =require('technicalindicators').bullishmarubozu;
var bearishmarubozu =require('technicalindicators').bearishmarubozu;
var eveningdojistar = require('technicalindicators').eveningdojistar;
var eveningstar =require('technicalindicators').eveningstar;
var bearishharami =require('technicalindicators').bearishharami;
var piercingline =require('technicalindicators').piercingline;
var bullishspinningtop =require('technicalindicators').bullishspinningtop;
var bearishspinningtop =require('technicalindicators').bearishspinningtop;
var morningdojistar =require('technicalindicators').morningdojistar;
var morningstar =require('technicalindicators').morningstar;
var threeblackcrows =require('technicalindicators').threeblackcrows;
var threewhitesoldiers =require('technicalindicators').threewhitesoldiers;



var Indicator = function (settings) {
  this.interval = settings.period + 1;
  this.result = [];
  this.age = 0;
  this.historyopen =[];
  this.historyhigh =[];
  this.historyclose =[];
  this.historylow =[];
  this.historyopen2 =[];
  this.historyhigh2 =[];
  this.historyclose2 =[];
  this.historylow2 =[];
  this.historyopen3 =[];
  this.historyhigh3 =[];
  this.historyclose3 =[];
  this.historylow3 =[];    
  this.historyopen4 =[];
  this.historyhigh4 =[];
  this.historyclose4 =[];
  this.historylow4 =[]; 

}

Indicator.prototype.update = function(candle) {

  this.age++;


  // We need sufficient history to get the right result.
  this.historyopen.push(candle.open);
  this.historyhigh.push(candle.high);
  this.historyclose.push(candle.close);
  this.historylow.push(candle.low);
  this.historyopen2.push(candle.open);
  this.historyhigh2.push(candle.high);
  this.historyclose2.push(candle.close);
  this.historylow2.push(candle.low);
  this.historyopen3.push(candle.open);
  this.historyhigh3.push(candle.high);
  this.historyclose3.push(candle.close);
  this.historylow3.push(candle.low);
  this.historyopen4.push(candle.open);
  this.historyhigh4.push(candle.high);
  this.historyclose4.push(candle.close);
  this.historylow4.push(candle.low);

  if(this.historyopen2.length > 2){
    // remove oldest value
    this.historyopen2.shift();
    this.historyhigh2.shift();
    this.historyclose2.shift();
    this.historylow2.shift();
  }  
  if(this.historyopen3.length > 3){
    // remove oldest value
    this.historyopen3.shift();
    this.historyhigh3.shift();
    this.historyclose3.shift();
    this.historylow3.shift();
  }  
  if(this.historyopen4.length > 4){
    // remove oldest value
    this.historyopen4.shift();
    this.historyhigh4.shift();
    this.historyclose4.shift();
    this.historylow4.shift();
  }    


  if(this.historyopen.length > this.interval){
    // remove oldest value
    this.historyopen.shift();
    this.historyhigh.shift();
    this.historyclose.shift();
    this.historylow.shift();

  }
    this.calculate(candle);

  return;
}

/*
 * Handle calculations
 */
Indicator.prototype.calculate = function(candle) {
  var singleinput = {
    open: candle.open,
    high: candle.high,
    close: candle.close,
    low: candle.low,
  }

  var input = {
    open: this.historyopen,
    high: this.historyhigh,
    close: this.historyclose,
    low: this.historylow,
  }

  var input2 = {
    open: this.historyopen2,
    high: this.historyhigh2,
    close: this.historyclose2,
    low: this.historylow2,
  }

  var input3 = {
    open: this.historyopen3,
    high: this.historyhigh3,
    close: this.historyclose3,
    low: this.historylow3,
  }
/*
    var input4 = {
    open: this.historyopen4,
    high: this.historyhigh4,
    close: this.historyclose4,
    low: this.historylow4,
  }
*/

  if(this.age>30){
    this.result.abandonedbaby = abandonedbaby(input3);
    this.result.bearishengulfingpattern = bearishengulfingpattern(input2);
    this.result.bullishengulfingpattern = bullishengulfingpattern(input2);
    this.result.darkcloudcover =darkcloudcover(input2);
    this.result.downsidetasukigap =downsidetasukigap(input3);
    this.result.doji =doji(candle);
    this.result.dragonflydoji =dragonflydoji(candle);
    this.result.gravestonedoji =gravestonedoji(candle);
    this.result.bullishharami =bullishharami(input2);
    this.result.bearishharamicross =bearishharamicross(input2);
    this.result.bullishharamicross =bullishharamicross(input2);
    this.result.bullishmarubozu =bullishmarubozu(candle);
    this.result.bearishmarubozu =bearishmarubozu(candle);
    this.result.eveningdojistar = eveningdojistar(input3);
    this.result.eveningstar =eveningstar(input3);
    this.result.bearishharami =bearishharami(input2);
    this.result.piercingline =piercingline(input2);
    this.result.bullishspinningtop =bullishspinningtop(candle);
    this.result.bearishspinningtop =bearishspinningtop(candle);
    this.result.morningdojistar =morningdojistar(input3);
    this.result.morningstar =morningstar(input3);
    this.result.threeblackcrows =threeblackcrows(input3);
    this.result.threewhitesoldiers =threewhitesoldiers(input3);
    this.result.bullish =  bullish(input);
    this.result.bearish =  bearish(input);
  }
}

module.exports = Indicator;