var async = require('async');
var randomExt = require('random-ext');
var request = require('request');

// Creates a random gene if prop='all', creates one random property otherwise
function create_gene(prop) {
    var properites = {
        optInTimePeriod: randomExt.integer(24, 8),
        adxOptInTimePeriod: randomExt.integer(24, 8),
        adxthreshold: randomExt.float(75, 30).toFixed(1),
        minusgap: randomExt.float(6, 20).toFixed(1),
        plusgap: randomExt.integer(30, 10),
        vixPeriod: randomExt.float(15, 4).toFixed(1),
        upperwvf: randomExt.float(15, 0).toFixed(1),
        lowerwvf: randomExt.float(15, 0).toFixed(1),
        t1: randomExt.integer(3, 0),
        t2: randomExt.integer(3, 0),
    };
    if (prop == 'all')
        return properites;
    else {
        return properites[prop];
    }

}

// Creates random population from genes
function create_population(amount) {
    var population = [];

    for (var i = 0; i < amount; i++) {
        population.push(create_gene('all'));
    }

    return population;
}

// Pairs two parents returning two new childs
function crossover(a, b) {
    var len = Object.keys(a).length;
    var cross_point = randomExt.integer(len - 1, 1);
    var tmp_a = {};
    var tmp_b = {};
    var curr_point = 0;
    for (var i in a) {
        if (a.hasOwnProperty(i) && b.hasOwnProperty(i)) {
            if (curr_point < cross_point) {
                tmp_a[i] = a[i];
                tmp_b[i] = b[i];
            }
            else {
                tmp_a[i] = b[i];
                tmp_b[i] = a[i];
            }
        }
        curr_point++;
    }

    return [tmp_a, tmp_b];
}

// Mutates object a at most maxAmount times
function mutate(a, maxAmount) {
    var amt = randomExt.integer(maxAmount, 0);
    var all_props = Object.keys(a);

    var tmp = {};

    for (var p in a) {
        if (a.hasOwnProperty(p))
            tmp[p] = a[p];
    }

    for (var i = 0; i < amt; i++) {
        var position = randomExt.integer(0, a.length);
        var prop = all_props[position];
        tmp[prop] = create_gene(prop);
    }

    return tmp;
}

// For the given population and fitness, returns new population and max score
function run_epoch(population, variation, population_amt, mutate_elements, fitness_arr) {
    var selection_prob = [];
    var fitness_sum = 0;
    var max_fitness = [0, 0];

    for (var i = 0; i < population_amt; i++) {
        if (fitness_arr[i] > max_fitness[0])
            max_fitness = [fitness_arr[i], i];
        fitness_sum += fitness_arr[i];
    }


    for (var j = 0; j < population_amt; j++) {
        selection_prob[j] = fitness_arr[j] / fitness_sum;
    }

    var new_population = [];

    while (new_population.length < population_amt * (1 - variation)) {
        var a, b;
        var selected_prob = randomExt.float(1, 0);
        for (var k = 0; k < population_amt; k++) {
            selected_prob -= selection_prob[k];
            if (selected_prob <= 0) {
                a = population[k];
                break;
            }
        }
        selected_prob = randomExt.float(1, 0);
        for (k = 0; k < population_amt; k++) {
            selected_prob -= selection_prob[k];
            if (selected_prob <= 0) {
                b = population[k];
                break;
            }
        }
        var res = crossover(mutate(a, mutate_elements), mutate(b, mutate_elements));
        new_population.push(res[0]);
        new_population.push(res[1]);
    }

    for (var l = 0; l < population_amt * variation; l++) {
        new_population.push(create_gene('all'));
    }

    return [new_population, max_fitness];
}

// Calls api for every element in test_series and returns gain for each
function fitness_api(tests_series, callback) {

    var results = [];

    async.mapSeries(tests_series, function (data, callback) {
        var outconfig = {
 //SET UP AS PER CONFIG.JS
            watch: {exchange: 'poloniex', currency: 'BTC', asset: 'BELA'},
            profitSimulator: {
                fee: 0.25,
                slippage: 0.05,
                simulationBalance: {asset: 1, currency: 100},
                enabled: true
            },
            'PUT STRAT NAME HERE': {
                parameters: {optInTimePeriod: data.optInTimePeriod},
                adxparameters: {optInTimePeriod: data.adxOptInTimePeriod},
                thresholds: {
                    adxthreshold: data.adxthreshold,
                    minusgap: data.minusgap,
                    plusgap: data.plusgap,
                    vixperiod: data.vixPeriod,
                    upperwvf: data.upperwvf,
                    lowerwvf: data.lowerwvf,
                    t1: data.t1,
                    t2: data.t2
                }
            },
            valid: true
        };
        request.post({
                url: 'http://localhost:3000/api/backtest',
                form: outconfig
            },
            function (err, httpResponse, body) {
                jsongap = JSON.parse(body);
                results.push(jsongap.report.profit);
                return callback(null, body);
            });
    }, function () {
        callback(results)
    });
}
// ********************************************************************
// Configurable parameters
// --------------------------------------------------------------------
// How much completely new units will be added to the population
var variation = 0.1; // Population * variation must be a whole number!!

// Population size, better reduce this for larger data
var population_amt = 10;

// How many components maximum to mutate at once
var mutate_elements = 4;

// When the algorithm reaches this value it will stop,
// but you can stop it any time you wish since the last max parameters are outputted every epoch
var target_value = 0.1;
// --------------------------------------------------------------------

var population = create_population(population_amt);
var population_fitness;
var epoch_number = 0;
console.log("Starting training with: " + population_amt + " units");


async.doWhilst(function (callback) {

    fitness_api(population, function (result) {
        population_fitness = result;
        callback();
    })

}, function () {

    epoch_number++;
    var results = run_epoch(population, variation, population_amt, mutate_elements, population_fitness);

    var new_population = results[0];
    var max_result = results[1];
    var value = max_result[0];
    var position = max_result[1];

    console.log("Epoch number: " + epoch_number);
    console.log("Max value: " + value+ " max value position: "+position);
    console.log("Max parametars:");
    console.log(population[position]);

    population = new_population;

    return value < target_value;
}, function () {
    console.log("Finished!");
});