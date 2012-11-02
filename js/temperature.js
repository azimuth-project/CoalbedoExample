// some globals
var INSOLATION_A = 218.0;           // watts per square meter
var INSOLATION_RATE_B = 1.9;        // watts per square meter per celcius
var INSOLATION_Q_BASE = 342.5;
var HEAT_CAPACITY_C = 0.5 * 1e7;
var TEMPERATURE_RANGE = [-50, 50], 
    T0 = TEMPERATURE_RANGE[0],
    T1 = TEMPERATURE_RANGE[1];
var NO_OF_CURVES = 20; 
var INITIAL_TEMPERATURES = [];

// slider params
var MIN_g = 0, MAX_g = 0.1, START_g = 0.05, STEP_g = 0.001;
var MIN_X = 0, MAX_X = 50, START_X = 25, STEP_X = 0.5;
var MIN_t1 = 0, MAX_t1 = 2, START_t1 = 1, STEP_t1 = 0.02;

// time interval
var tI = [MIN_t1, yearsToSecs(MAX_t1)], 
    tScale = yearsToSecs(1);    

// number of time steps taken to plot over time interval
var N = 100;

// setup the board for coalbedo graph
function initCharts(temperatureId, controlId) {
    // JSXGraph setup
    JXG.Options.text.useMathJax = true;
    
    // init the controls and the temperature board
    var controls = initControls(controlId);
    var tb = initTemperatureBoard(temperatureId, controls.slider);
    var tps = initTemperaturePlots(tb);
    
    function updateHook() { updateTemperatureBoard(tb, tps, controls.sliders); }
    controls.board.addHook(updateHook);
}

function initControls(controlId) {
    var controlBoard = JXG.JSXGraph.initBoard(controlId, {
        boundingbox: [0, 150, 400, 0], // [minX, maxY, maxX, minY]
        axis: false,
        showCopyright: false,
        showNavigation: false
    });
    // setup the gamma slider and add some text to label it
    var sg=controlBoard.create('slider', 
        [   [10, 110],    // slide from [X, Y]
            [310, 110],  // slide to [X, Y]
            [MIN_g, START_g, MAX_g]],  // min, start and max values for slider
        {snapWidth: STEP_g}  // slider increment
    );
    function GAMMA_SLIDER_LABEL() { return 'Coalbedo transition rate \\(\\gamma\\)'; }
    controlBoard.create('text', [
        15,  // X 
        120,  // Y
        GAMMA_SLIDER_LABEL  // label function 
    ]);

    // setup the X slider and add some text to label it
    var sX=controlBoard.create('slider', 
        [   [10, 70],    // slide from [X, Y]
            [310, 70],  // slide to [X, Y]
            [MIN_X, START_X, MAX_X]],  // min, start and max values for slider
        {snapWidth: STEP_X}  // slider increment
    );
    function X_SLIDER_LABEL() { return 'Value of insolation bump \\(X\\)'; }
    controlBoard.create('text', [
        15,  // X 
        80,  // Y
        X_SLIDER_LABEL  // label function 
    ]);

    // setup the t1 slider and add some text to label it
    var st1=controlBoard.create('slider', 
        [   [10, 30],    // slide from [X, Y]
            [310, 30],  // slide to [X, Y]
            [MIN_t1, START_t1, MAX_t1]],  // min, start and max values for slider
        {snapWidth: STEP_t1}  // slider increment
    );
    function T1_SLIDER_LABEL() { return 'End value of time interval \\([0, t]\\) over which bump \\(X\\) is applied'; }
    controlBoard.create('text', [
        15,  // X 
        40,  // Y
        T1_SLIDER_LABEL  // label function 
    ]);
    
    var controls = {board: controlBoard, sliders: {gamma: sg, X: sX, t1: st1}};

    return controls;
}

function initTemperatureBoard(temperatureId, slider) {
    var temperatureBoard = JXG.JSXGraph.initBoard('temperature-box', {
        boundingbox: [MIN_t1 - 0.02, T1, MAX_t1, T0],
        axis:true,
        showCopyright:false,
        showNavigation:false
    });
    
    return temperatureBoard;
}

function toHex(x) {
    var result = "00";
    var i = Math.floor(Number(x));
    if (0 <= i && i < 16) {
        result = "0" + i.toString(16);
    } else {
        result = i.toString(16);
    }
    return result;
}

function initTemperaturePlots(temperatureBoard) {
    var temperaturePlots = [];
    var incT = (T1 - T0) / NO_OF_CURVES;
    var incColor = 0xff / NO_OF_CURVES;
    for (var i=0, T=T0, red=0x00, blue=0xff; i < NO_OF_CURVES; i++) {
        INITIAL_TEMPERATURES[i] = T;
        var redStr = toHex(red),
            blueStr = toHex(blue);
        var color = '#' + redStr + '88' + blueStr;
        
        // the temperature plot global is initialized empty and filled in updateTemperatureBoard()
        temperaturePlots[i] = temperatureBoard.createElement(
            'curve', 
            [[], []],
            {
                strokeColor: color,
                strokeWidth: 3,
                highlight: true
            }
        );
        T += incT;
        red += incColor;
        blue -= incColor;
    }
    return temperaturePlots;
}

function yearsToSecs(y) {
    return y * 365.25 * 24 * 60 * 60;
}

// rational approximation to tanh, as gratefully scraped from SO:
//   http://stackoverflow.com/questions/6118028/fast-hyperbolic-tangent-approximation-in-javascript
function rational_tanh(x) {
    if (x < -3) return -1.0;
    else if (x > 3) return 1.0;
    else return x * (27 + x * x) / (27 + 9 * x * x);
}

function tanh(x) {
    return rational_tanh(x);
}

// makes use of currentGamma global
function coalbedo(g, T) {
    var ai = 0.35,  // ice-i planet
        af = 0.7;  // ice-free planet
    var ap = ai + 0.5 * (af - ai) * (1.0 + tanh(g * T));
    return ap;
}

// makes use of currentX, currentTI0 and currentTI1 globals
function insolationBump_f(X, t1, t) {
    var t0 = 0;
    if (yearsToSecs(t0) <= t && t < yearsToSecs(t1)) return X;
    else return 0;
}

function insolationQ(X, t1, t) {
    return INSOLATION_Q_BASE + insolationBump_f(X, t1, t);
}

function temperatureOde(g, X, t1, t, Ts) {
    var A = INSOLATION_A,
        B = INSOLATION_RATE_B,
        C = HEAT_CAPACITY_C,
        Qt = insolationQ(X, t1, t);
        
    var dTs_by_dt = [];
    var T, ap, i, lenTs;
    for (i=0, lenTs=Ts.length; i < lenTs; i++) {
        T = Ts[i];
        ap = coalbedo(g, T);
        dTs_by_dt[i] = (-A - B * T + Qt * ap) / C;
    }

    return dTs_by_dt;
}

function solvedOdeData(g, X, t1) {
    // initial value
    var TS0 = INITIAL_TEMPERATURES;
    
    function ode(t, Ts) { return temperatureOde(g, X, t1, t, Ts); }
    
    // data from solved ode
    var data = JXG.Math.Numerics.rungeKutta('heun', TS0, tI, N, ode);
    
    return data;
}

function updateTemperatureBoard(temperatureBoard, temperaturePlots, sliders) {
    temperatureBoard.suspendUpdate();
    var g = sliders.gamma.Value(),
        X = sliders.X.Value(),
        t1 = sliders.t1.Value();
    var Ts = solvedOdeData(g, X, t1);
    for (var i=0, lenPlots=temperaturePlots.length; i < lenPlots; i++) {
        // this is the nasty function-in-a-function JavaScript trick to ensure
        // the inner function closes over the data for the current iteration i
        temperaturePlots[i].updateDataArray = function(ii) { return function() {
            // time intervals to push alongside data
            var tCurrent = tI[0],
                tStep = (tI[1] - tI[0]) / N;

            this.dataX = [];
            this.dataY = [];
            for (j=0; j < Ts.length; j++) {
                this.dataX[j] = tCurrent / tScale;
                this.dataY[j] = Ts[j][ii];
                tCurrent += tStep;
            }
        }; }(i);
    }
    temperatureBoard.unsuspendUpdate();
}
