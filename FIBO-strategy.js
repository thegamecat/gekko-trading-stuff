// This version of FIB retracement only uses the FIB MAX as the sell point.
// The buy part is handled by a roc / adx review.
//this contains a ruleset for 60second candles. 


var config = require('../core/util.js').getConfig();
var settings = config['FIBO'];
//console.log(settings);
var log = require('../core/log');
var fsw = require('fs');
var grtimestamp = '';
var grreadtime = '0';
var outtxt = '0';
var headerset = '';
var headertxt = '';
var buysell = "";
var buytime = "";
var selltime ="";
var csize = config.tradingAdvisor.candleSize;
var exchange = config.watch.exchange;
var currency = config.watch.currency;
var asset = config.watch.asset;
var strat = config.tradingAdvisor.method;
var filetime = new Date().getTime();
var fname = strat+"-"+csize+"-"+exchange+"-"+currency+"-"+asset+"-"+filetime+".csv";

config.suckmyballs = "yeah";

// Let's create our own strat
var strat = {};
var config = require('../core/util.js').getConfig();
var settings = config['FIBO'];
//console.log(settings);

// Prepare everything our method needs
strat.init = function () {
    this.name = 'FIBO';

	this.historylength =100;
	this.historyadx =[];
	this.historyplusdmi =[];
	this.historyminusdmi =[];
	this.historyema20 =[];
 	this.historyema50 =[];
	this.historyema100 =[];
	this.historyema200 =[];	
	this.counter =0;
	this.plusgapupcounter=0;
	this.minusgapupcounter=0;
	this.plusgapdowncounter=0;
	this.minusgapdowncounter=0;
	this.negativeroc = 0;
	this.positiveroc = 0;
	
//    this.requiredHistory = settings.histSize;
    this.requiredHistory = config.tradingAdvisor.historySize;;
    this.addIndicator('fibo', 'FIBO', settings);
    this.addIndicator('SMA', 'SMA', 10);
    this.addTalibIndicator('myadx', 'adx', settings);
    this.addTalibIndicator('myroc', 'roc', settings);


	this.addTalibIndicator('myplusdi', 'plus_di', settings);
	this.addTalibIndicator('myplusdm', 'plus_dm', settings);
	this.addTalibIndicator('myminusdi', 'minus_di', settings);
	this.addTalibIndicator('myminusdm', 'minus_dm', settings);
	this.addTalibIndicator('myroc', 'roc', settings);
	this.addIndicator('EMA20', 'EMA', 20);
	this.addIndicator('EMA50', 'EMA', 50);
	this.addIndicator('EMA100', 'EMA', 100);
	this.addIndicator('EMA200', 'EMA', 200);
	
	this.trend = "";
	this.direction = "";
	this.stop = "";



    this.num = 0;
    this.candle = null;
};

// What happens on every new candle?
strat.update = function (candle) {
	var adxresult = this.talibIndicators.myadx.result["outReal"];
	var rocresult = this.talibIndicators.myroc.result["outReal"];

	var price = candle.close;
    this.candle = candle;
	var historyplusgap ="";
	var historyminusgap ="";
	var myplusdiresult = this.talibIndicators.myplusdi.result["outReal"];
	var myplusdmresult = this.talibIndicators.myplusdm.result["outReal"];  
	var myminusdiresult = this.talibIndicators.myminusdi.result["outReal"];
	var myminusdmresult = this.talibIndicators.myminusdm.result["outReal"];  
	var plusgap = 0;
	var minusgap = 0;
	var buysell = false;
	var upordown = "";
	var emagap="";
	var emapercentage="";
	
	if(myplusdiresult>myminusdiresult){
	  plusgap=myplusdiresult- myminusdiresult;
	  minusgap=0;
	}

	if(myplusdiresult<myminusdiresult){
	 minusgap =myminusdiresult - myplusdiresult ;
	  plusgap =0;
	}
	
	var ema20 = this.indicators.EMA20.result;
	var ema50 = this.indicators.EMA50.result;
	var ema100 = this.indicators.EMA100.result;
	var ema200 = this.indicators.EMA200.result;

	this.historyadx.push(adxresult);
	this.historyplusdmi.push(myplusdiresult);
	this.historyminusdmi.push(myminusdiresult);
	this.historyema20.push(ema20);
	this.historyema50.push(ema50);
	this.historyema100.push(ema100);
	this.historyema200.push(ema200);

	if(this.historyadx.length>this.historylength) {
		 this.historyadx.shift();
		 this.historyplusdmi.shift();		 
		 this.historyminusdmi.shift();		 
		 this.historyema20.shift();		 
		 this.historyema50.shift();		 
		 this.historyema100.shift();		 
		 this.historyema200.shift();		 	 
	}	
	
	if(myplusdiresult > this.historyplusdmi[this.historyplusdmi.length-2]){
		this.plusgapupcounter=this.plusgapupcounter+1;
		this.plusgapdowncounter = 0;
	}else{
		this.plusgapdowncounter=this.plusgapdowncounter+1;
		this.plusgapupcounter = 0;	
	}

	if(myminusdiresult > this.historyminusdmi[this.historyminusdmi.length-2]){
		this.minusgapupcounter=this.minusgapupcounter+1;
		this.minusgapdowncounter = 0;
	}else{
		this.minusgapdowncounter=this.minusgapdowncounter+1;
		this.minusgapupcounter = 0;	
	}
	

if(ema200>ema20){
	emagap = ema200-ema20;
	emapercentage = emagap/ema200;
}else if(ema200<ema20){
	emagap = ema20-ema200;
	emapercentage = emagap/ema20;
}
	//if(price>ema20 && price>ema50 && price>ema100 && price>ema200 && ema20<ema200 && emapercentage> .025 || this.stop != "" && price<this.stop && this.trend == "long"){
		//with stoploss105k usd
	if(price>ema20 && price>ema50 && price>ema100 && price>ema200 && ema20<ema200 && emapercentage> .025){
		
		if(this.stop != "" && price<this.stop){
			console.log("stoplosss triggered - "+ this.stop);
		}
		
		
		

		this.direction="short";
		if(this.trend == "long"){
			buysell = "selling asset";
			this.stop = "";
			selltime = price;
			this.trend = this.direction;
			this.advice(this.direction);
		}
	
	}else if(price<ema20 && price<ema50 && price<ema200 && price<ema100 && emapercentage> .02 && myminusdiresult >30 && rocresult< -1.5 && adxresult>60 && this.direction!="long"){
		buytime = price;
		if(this.stop==""){
			this.stop = buytime-(buytime*.2);
			console.log("price = "+price);			
			console.log("stoploss = "+this.stop);
			this.direction="long";
			buysell = "buying asset";
			this.trend = this.direction;
			this.advice(this.direction);
		}
	}


grreadtime = candle.start.toDate();
  headertxt = "date,price,roc,adx,buys (USD),sells (BTC),ema20, ema50, ema100, ema200,emapercentage,myminusdiresult,myplusdiresult,minusgapupcounter,plusgapupcounter,minusgapdowncounter,plusgapdowncounter,plusgap,minusgap\n";
  outtxt = grreadtime+","+ price+","+rocresult+","+adxresult+","+buytime+","+selltime+","+ema20+","+ema50+","+ema100+","+ema200+","+ emapercentage+","+myminusdiresult+","+myplusdiresult+","+this.minusgapupcounter+","+this.plusgapupcounter+","+this.minusgapdowncounter+","+this.plusgapdowncounter+","+plusgap+","+minusgap+"\n";
  	

    if (headerset === "") {
        fsw.appendFileSync(fname, headertxt, encoding = 'utf8');
        headerset = "1";
    }
    // console.log(this.fname);
    fsw.appendFileSync(fname, outtxt, encoding = 'utf8');

	outtxt = "";
	buysell = "";
	buytime = "";
	selltime = "";
	if(rocresult<0 ){
		this.negativeroc = this.negativeroc+1;
		this.positiveroc = 0;
	}else if(rocresult>0){
		this.negativeroc = 0;
		this.positiveroc = this.positiveroc+1;
	}else if(rocresult == 0){
		this.negativeroc = 0;
		this.positiveroc = 0;
	}
	


};

// For debugging purposes.
strat.log = function () {

};

// Based on the newly calculated
// information, check if we should
// update or not.
strat.check = function () {

};

module.exports = strat;
