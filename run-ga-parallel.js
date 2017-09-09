//run server.js with the following command:

//node --max-old-space-size=8192 server.js

// then run this to run the GA

// node run-ga-parallel.js


const async = require('async');
const randomExt = require('random-ext');
const request = require('request');

// Creates a random gene if prop='all', creates one random property otherwise
function create_gene(prop) {
    let candle_values = [120,1440,240,120,2,1,15,30,60];
    let properites = {
//here add the indicators and the ranges you want to handle	
//in this case my strategy wants to test RSI ranges	
		rsishort: randomExt.integer(90,60),
		rsilong: randomExt.integer(40, 10),
        "candleSize": candle_values[randomExt.integer(8,0)],
    };
//	console.log(properites);
    if (prop === 'all')
        return properites;
    else {
        return properites[prop];
    }

}

// Creates random population from genes
function create_population(amount) {
    let population = [];

    for (let i = 0; i < amount; i++) {
        population.push(create_gene('all'));
    }

    return population;
}

// Pairs two parents returning two new childs
function crossover(a, b) {
    let len = Object.keys(a).length;
    let cross_point = randomExt.integer(len - 1, 1);
    let tmp_a = {};
    let tmp_b = {};
    let curr_point = 0;
    for (let i in a) {
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
    let amt = randomExt.integer(maxAmount, 0);
    let all_props = Object.keys(a);

    let tmp = {};

    for (let p in a) {
        if (a.hasOwnProperty(p))
            tmp[p] = a[p];
    }

    for (let i = 0; i < amt; i++) {
        let position = randomExt.integer(0, a.length);
        let prop = all_props[position];
        tmp[prop] = create_gene(prop);
    }

    return tmp;
}

// For the given population and fitness, returns new population and max score
function run_epoch(population, variation, population_amt, mutate_elements, fitness_arr) {
    let selection_prob = [];
    let fitness_sum = 0;
    let max_fitness = [0, 0];

    for (let i = 0; i < population_amt; i++) {
        if (fitness_arr[i] > max_fitness[0])
            max_fitness = [fitness_arr[i], i];
        fitness_sum += fitness_arr[i];
    }
    if (fitness_sum === 0) {
        for (let j = 0; j < population_amt; j++) {
            selection_prob[j] = 1 / population_amt;
        }
    }
    else {
        for (let j = 0; j < population_amt; j++) {
            selection_prob[j] = fitness_arr[j] / fitness_sum;
        }
    }
    let new_population = [];

    while (new_population.length < population_amt * (1 - variation)) {
        let a, b;
        let selected_prob = randomExt.float(1, 0);
        for (let k = 0; k < population_amt; k++) {
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
        let res = crossover(mutate(a, mutate_elements), mutate(b, mutate_elements));
        new_population.push(res[0]);
        new_population.push(res[1]);
    }

    for (let l = 0; l < population_amt * variation; l++) {
        new_population.push(create_gene('all'));
    }

    return [new_population, max_fitness];
}

// Calls api for every element in test_series and returns gain for each
function fitness_api(tests_series, callback) {
    const number_of_parallel_queries = 8;
    async.mapLimit(tests_series, number_of_parallel_queries, function (data, callback) {
        let outconfig = {
            "gekkoConfig": {
                "watch": {
                    "exchange": "poloniex",
                    "currency": "USDT",
                    "asset": "ETH"
                },
                "paperTrader": {
                    "fee": 0.25,
                    "slippage": 0.05,
                    "feeTaker": 0.25,
                    "feeUsing": "maker",					
					"reportInCurrency": true,                    
					"simulationBalance": {
                        "asset": 1,
                        "currency": 100
                    },
                    "reportRoundtrips": true,
                    "enabled": true
                },
				"writer": {
					"enabled": false,
					"logpath": ""
				},				
                "tradingAdvisor": {
                    "enabled": true,
                    "method": "test-allv2",
					"candleSize": data.candleSize,
//					"candleSize": 1,
                    "historySize": 10,
					  talib: {
							enabled: false,
							version: '1.0.2'
					}
                },
//this is just the same as your usual setup in config.js				
                "add your strategy here, it's the same name you use in config.js": {
                    "parameters": {
                        "optInTimePeriod": 14,
                        "historylength": 14,
//here we reference the indicator range outputs into the config						
                        "rsishort": data.rsishort,
                        "rsilong": data.rsilong,
                    },
               },
                "backtest": {
//use scan or a daterange by commenting / uncommenting out					
					"daterange": "scan",
/*                   "daterange": {
                        "from": "2017-05-04 00:00:00",
                        "to": "2017-08-18 00:00:00"
*/
						}	
					
				},
                "performanceAnalyzer": {
                    "riskFreeReturn": 5,
                    "enabled": true
                },
                "valid": true
            },
            "data": {
                "candleProps": ["close", "start"],
                "indicatorResults": true,
                "report": true,
                "roundtrips": true,
                "trades": true
            }
        };

        request.post({
                url: 'http://localhost:3000/api/backtest',
                json: outconfig,
				headers: {
					"Content-Type": "application/json"
				}	
            },
            function (err, httpResponse, body) {
                if (err)
                    console.log(err);

                // These properties will be outputted every epoch, remove property if not needed
                let properties = ['balance', 'profit', 'relativeProfit', 'yearlyProfit', 'relativeYearlyProfit', 'startPrice', 'endPrice', 'trades'];
				if(body===false){
				}

					let report = body.report;
					let result = {"profit": 0, "metrics": false};
					if (report) {
						let picked = properties.reduce(function (o, k) {
							o[k] = report[k];
							return o;
						}, {});
						result = {"profit": body.report.profit, "metrics": picked};
					}

                return callback(err, result);
            });
    }, function (err, results) {
        let profits = [];
        let other_metrics = [];
        for (let i in results) {
            if (results.hasOwnProperty(i)) {
                profits.push(results[i]["profit"]);
                other_metrics.push(results[i]["metrics"])
            }
        }
        callback(profits, other_metrics);
    });
}
// ********************************************************************
// Configurable parameters
// --------------------------------------------------------------------
// How many completely new units will be added to the population
const variation = 0.3; // Population * variation must be a whole number!!

// Population size, better reduce this for larger data
const population_amt = 8;

// How many components maximum to mutate at once
const mutate_elements = 14;

// When the algorithm reaches this value it will stop,
// but you can stop it any time you wish since the last max parameters are outputted every epoch
const target_value = 5000000000;
// --------------------------------------------------------------------

let population = create_population(population_amt);
let population_fitness;
let other_population_metrics;
let epoch_number = 0;
console.log("Starting training with: " + population_amt + " units");
let start_time = new Date().getTime();

let all_time_maximum = {parameters: {}, gain: 0, epoch_number: 0, other_metrics: {}};

async.doWhilst(function (callback) {
    start_time = new Date().getTime();
    fitness_api(population, function (result, other_metrics) {
        population_fitness = result;
        other_population_metrics = other_metrics;
        callback();
    })

}, function () {

    let end_time = new Date().getTime();
    epoch_number++;
    let results = run_epoch(population, variation, population_amt, mutate_elements, population_fitness);

    let new_population = results[0];

    let max_result = results[1];
    let value = max_result[0];
    let position = max_result[1];

    if (value >= all_time_maximum.gain) {
        all_time_maximum.parameters = population[position];
        all_time_maximum.other_metrics = other_population_metrics[position];
        all_time_maximum.gain = value;
        all_time_maximum.epoch_number = epoch_number;
    }
    console.log("--------------------------------------------------------------");
    console.log("Epoch number: " + epoch_number);
    console.log("Time it took (seconds): " + (end_time - start_time) / 1000);
    console.log("Max profit: " + value + "$" + " max profit position: " + position);
   console.log("Max parametars: ");
   console.log(population[position]);
    console.log("Other metrics: "); // Prints other metrics, they can be turned off on line 190
    console.log(other_population_metrics[position]);

    // Prints out the whole population with its fitness,
    // useful for finding properties that make no sense and debugging
    // for (let element in population) {
    //     console.log("Fitness: "+population_fitness[element]+" Properties:");
    //     console.log(population[element])
    // }

    console.log("--------------------------------------------------------------");
    console.log("Global maximum: " + all_time_maximum.gain + "$, parameters:");
   console.log(all_time_maximum.parameters);
    console.log("Other metrics of global maximum:");
    console.log("Global maximum so far:");
    console.log(all_time_maximum.other_metrics);
    console.log("--------------------------------------------------------------");

    population = new_population;

    return value < target_value;
}, function () {
    console.log("Finished!");
    console.log("All time maximum:");
    console.log(all_time_maximum)
});