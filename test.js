/*
This is a test strategy for Gekko

Add this into the Config

config.tradingAdvisor = {
	enabled: true,
	method:'test',
	candleSize: 1,
	historySize: 10,
	adapter: 'sqlite',
	talib: {
		enabled: true,
		version: '1.0.2'
	}
};




config["test"] = {
  parameters:{
    optInTimePeriod: 14
  },

  adxparameters:{
    optInTimePeriod: 14,
	optInAcceleration: 0,
	optInMaximum: 0	
  }
};

*/

const util = require('util');
var config = require('../core/util.js').getConfig();
var settings = config['test'];


// Let's create our own method
var method = {};

// Prepare everything our method needs
	
method.init = function() {
	this.name = 'test';

	this.trend = {
	direction: 'none',
	duration: 0,
	persisted: false,
	adviced: false
	};

	this.direction = "short";
 
	var customSettings = settings.parameters;
	var adxcustomSettings = settings.adxparameters;
	this.addTalibIndicator('myadx', 'adx', adxcustomSettings);
	this.addIndicator('EMA20', 'EMA', 20);
}


method.update = function(candle) {



	  var price = this.candle.close;

	  var adxresult = this.talibIndicators.myadx.result["outReal"];
	  var ema20 = this.indicators.EMA20.result;

 
	if(adxresult>70 && price>ema20 && this.direction=="long"){
		  this.direction="short";	
	}else if(adxresult>70 && price<ema20){
		  this.direction="long";	
	}


	if(this.trend==this.direction){
	//do nothing

	}else{
		if(this.direction=="short"){
		  selltime = price;
		}else if(this.direction=="long"){
		  buytime = price;
		}

		this.trend = this.direction;
		this.advice(this.direction);
	}
}


method.log = function() {
  // nothing!
}

// Based on the newly calculated
// information, check if we should
// update or not.
method.check = function() {

  
}

module.exports = method;

