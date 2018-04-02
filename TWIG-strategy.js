// helpers
var _ = require('lodash');
var log = require('../core/log.js');

// configuration
var config = require('../core/util.js').getConfig();
var settings = config.TWIG;

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function() {
    this.name = 'TWIG';

    this.currentTrend;
    this.requiredHistory = config.tradingAdvisor.historySize;

    // define the indicators we need
    this.lastPrice=0;
    this.addIndicator('twig', 'TWIG', settings);
}

// what happens on every new candle?
method.update = function(candle) {
    // nothing!
}

// for debugging purposes: log the last calculated
// EMAs and diff.
method.log = function() {
    //var twig = this.indicators.twig;
    //
    // log.debug('calculated TWIG properties for candle:');
    // log.debug('\t', 'long ema:', twig.long.result.toFixed(8));
    // log.debug('\t', 'short ema:', twig.short.result.toFixed(8));
    // log.debug('\t diff:', twig.result.toFixed(5));
    // log.debug('\t TWIG age:', twig.short.age, 'candles');
}

method.check = function() {
    var twig = this.indicators.twig;
    var diff = twig.result;
    //var price = this.lastPrice;
console.log("diff = "+diff);
    //var message = '@ ' + price.toFixed(8) + ' (' + diff.toFixed(5) + ')';

    if(diff > settings.thresholds.up) {
        //log.debug('we are currently in uptrend', message);

        if(this.currentTrend !== 'up') {
            this.currentTrend = 'up';
            this.advice('long');
        } else
            this.advice();

    } else if(diff < settings.thresholds.down) {
        //log.debug('we are currently in a downtrend', message);

        if(this.currentTrend !== 'down') {
            this.currentTrend = 'down';
            this.advice('short');
        } else
            this.advice();

    } else {
        //log.debug('we are currently not in an up or down trend', message);
        this.advice();
    }
}

module.exports = method;
