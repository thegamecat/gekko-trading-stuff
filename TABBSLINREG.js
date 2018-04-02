var BB = require('technicalindicators').BollingerBands;
var tools = require('../tradingFunctions');



var Indicator = function (settings) {
	console.log(settings);
	this.input = 'candle';
	this.interval = settings.count;
	this.standarddeviation = settings.standarddeviation;
	this.bb_linreg_upperdeviation = settings.bblinregupperdeviation;
	this.bb_linreg_lowerdeviation = settings.bblinreglowerdeviation;	
	this.bbout = [];
	this.result = [];
	this.historyopen =[];
	this.historyhigh =[];
	this.historyclose =[];
	this.historylow =[];
	this.bbupperhistory =[];
	this.bbmiddlehistory =[];
	this.bblowerhistory =[];
	this.bbpbhistory =[];	
	this.age = 0;
	this.vwphistory = [];	
}

Indicator.prototype.update = function(candle) {
	
	this.result.upper = 0;
	this.result.middle = 0;
	this.result.lower = 0;
	this.result.pb = 0;	
	this.result.pb_linreg_pearsonsR = 0;
	this.result.pb_linreg_pearsonsR = 0;
	this.result.pb_linreg_upperdeviation= 0;
	this.result.pb_linreg_lowerdeviation= 0;
	this.result.pb_linreg_Yintercept= 0;

	// We need sufficient history to get the right result.
	this.historyopen.push(candle.open);
	this.historyhigh.push(candle.high);
	this.historyclose.push(candle.close);
	this.historylow.push(candle.low);
	if(this.historyopen.length > this.interval){
		this.historyopen.shift();
		this.historyhigh.shift();
		this.historyclose.shift();
		this.historylow.shift();
		this.calculate(candle);


	
		//setup bb and get linreg for values
		//console.log(this.tfbb.indicators.tabbs.result.pb);	
		let bbupper = this.bbout.upper;
		let bbmiddle = this.bbout.middle;
		let bblower = this.bbout.lower;
		let bbpb = this.bbout.pb; 	
		
		
		
		let bbpb_linreg = 0;
	

		this.bbupperhistory.push(bbupper);
		this.bbmiddlehistory.push(bbmiddle);
		this.bblowerhistory.push(bblower);
		this.bbpbhistory.push(bbpb);

		if(this.bbupperhistory.length > this.interval){
			this.bbupperhistory.shift();
			this.bbmiddlehistory.shift();
			this.bblowerhistory.shift();
			this.bbpbhistory.shift();
			bbpb_linreg = tools.linReg(this.bbpbhistory, this.bb_linreg_upperdeviation, this.bb_linreg_lowerdeviation);
			this.result = {
				middle: bbmiddle,
				upper: bbupper,
				lower: bblower,
				pb: bbpb,
				pb_linreg_pearsonsR: bbpb_linreg.pearsonsR,
				pb_linreg_upperdeviation: bbpb_linreg.upperdeviation,
				pb_linreg_lowerdeviation: bbpb_linreg.lowerdeviation,
				pb_linreg_Yintercept: bbpb_linreg.Yintercept,				
			}
		}

		

	}
	

	return;
}

/*
 * Handle calculations
 */
Indicator.prototype.calculate = function(candle) {
  var input = {
    period: this.interval,
    values: this.historyclose,
    stdDev: this.standarddeviation
  }
  
var bb = new BB(input);
  this.bbout =  bb.getResult()[0];
}

module.exports = Indicator;
