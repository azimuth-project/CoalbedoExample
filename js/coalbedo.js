// JSXGraph Options setup -- many JSXGraph features are controlled by these; a full list is here:
//      http://jsxgraph.uni-bayreuth.de/wiki/index.php/Options
JXG.Options.text.useMathJax = true;

// global constants used in model
var COALBEDO_ICY_AI = 0.35,     // coalbedo of an ice-i planet
    COALBEDO_ICE_FREE_AF = 0.7, // coalbedo of an ice-free planet
    INSOLATION_A = 218.0,       // watts per square meter
    INSOLATION_RATE_B = 1.9,    // watts per square meter per celcius
    HEAT_CAPACITY_C = 0.5 * 1e7;

// setup the board for coalbedo graph
var controls, tb, cb; // left exposed for debugging
function initCharts(temperatureId, controlId, coalbedoId) {    
    // init the controls and the boards
    controls = initControls(controlId);
    tb = initTemperatureBoard(temperatureId, controls.slider);
    cb = initCoalbedoBoard(coalbedoId, controls.slider);
    
    // add the temperature and coalbedo boards as dependents of the control board (so they get updated)
    controls.board.addChild(tb);
    controls.board.addChild(cb);
}

function initControls(controlId) {
    // create the control board: coords for the bounding box are somewhat arbitrary since 
    // we are not drawing anything to scale (had in mind a div element twice as wide as high)
    var controlBoard = JXG.JSXGraph.initBoard(controlId, {
        boundingbox: [0, 30, 200, 0], // [minX, maxY, maxX, minY]
        axis: false,
        showCopyright: false,
        showNavigation: false
    });
    
    // slider parameter constants
    var MIN_g = 0.0, 
        START_g = 0.05, 
        MAX_g = 0.1, 
        STEP_g = 0.001;
        
    // function returning the label for slider (need to do this for MathJax to work)
    function GAMMA_SLIDER_LABEL() {
        return "transition rate \\(\\gamma\\) from icy coalbedo \\(a_i\\) to ice-free coalbedo \\(a_f\\)";    
    }
    
    // setup the slider and add some text to label it
    var s=controlBoard.create('slider', 
        [   [0, 10],    // slide from [X, Y]
            [100, 10],  // slide to [X, Y]
            [MIN_g, START_g, MAX_g]],  // min, start and max values for slider
        {snapWidth:STEP_g}  // slider increment
    );
    controlBoard.create('text', [
        0,  // X 
        25, // Y
        GAMMA_SLIDER_LABEL  // label function 
    ]);
    
    // we return both the board and the slider as the 'controls'
    var controls = {board: controlBoard, slider: s};
    
    return controls;
}

function initTemperatureBoard(temperatureId, slider) {
    // setup the board for temperature curve
    var temperatureBoard = JXG.JSXGraph.initBoard(temperatureId, { 
        boundingbox: [-10, 50, 530, -50],
        axis:false,
        grid:false,
        showCopyright:false,
        showNavigation:false,
        pan:false
    });
    
    // add Q_eq axis
    temperatureBoard.create('axis',
        [[0.0, 0.0],
         [530.0, 0.0]],
        {ticks : { 
            // drawLabels : true,
            // drawZero : false,
            // insertTicks : true,
            minTicksDistance : 10,
            // minorHeight : 4,      // if <0: full width and height
            majorHeight : 6,         // if <0: full width and height
            minorTicks : 0,   //no minor tick between each major tick
            // ticksDistance: 1,         // TODO doc
            // strokeOpacity : 0.25
        }}
    );    
    // add T axis
    temperatureBoard.create('axis',
        [[0.0, 0.0],
         [0.0, 50.0]],
        {ticks : {
            majorHeight: 6,
            minorTicks : 1,   //only 1 minor tick between each major tick
        }}
    );

    // add text for axes (the function() is needed for MathJax to work)
    function T_AXIS_LABEL(){return "\\(T\\)";}
    function Q_AXIS_LABEL(){return "\\(Q_\\textrm{eq}\\)";}
    temperatureBoard.create('text', [10, 45, T_AXIS_LABEL]);
    temperatureBoard.create('text', [480, -3, Q_AXIS_LABEL]);
    
    // add the temperature curve for the board
    function insolationX(T) {return insolationEq(slider.Value(), T);}
    function insolationY(T) {return T;}
    temperatureBoard.create('curve', [insolationX, insolationY, -50, 50], {strokeWidth:3, highlight:false});
    
    return temperatureBoard;
}

function initCoalbedoBoard(coalbedoId, slider) {
    function T_AXIS_LABEL(){return "\\(T\\)";}
    function AP_AXIS_LABEL(){return "\\(a_p\\)";}
    
    var coalbedoBoard = JXG.JSXGraph.initBoard(coalbedoId, {
        boundingbox: [-50, 0.75, 50, -0.1], 
        axis:true, 
        showCopyright:false, 
        showNavigation:false, 
        pan:false
    });
    function coalbedoY(T){return coalbedo(slider.Value(), T);}
    coalbedoBoard.create('functiongraph', [coalbedoY], {strokeWidth:3, highlight:false});
    coalbedoBoard.create('text', [43, -0.05, T_AXIS_LABEL]);
    coalbedoBoard.create('text', [1, 0.6, AP_AXIS_LABEL]);
    
    return coalbedoBoard;
}

// rational approximation to tanh, as gratefully scraped from SO:
//   http://stackoverflow.com/questions/6118028/fast-hyperbolic-tangent-approximation-in-javascript
function rational_tanh(x) {
    if ( x < -3 ) return -1.0;
    else if ( x > 3 ) return 1.0;
    else return x * ( 27 + x * x ) / ( 27 + 9 * x * x );
}
function tanh(x) {
    return rational_tanh(x);
}

// coablbedo for temperature T for a given gamma g
function coalbedo(g, T) {
    var ai = COALBEDO_ICY_AI;
    var af = COALBEDO_ICE_FREE_AF;
    var ap = ai + 0.5 * (af - ai) * (1.0 + tanh(g * T));
    return ap;
}

// equilibrium insolation at T for a given gamma g
function insolationEq(g, T) {
    var A = INSOLATION_A;
    var B = INSOLATION_RATE_B;
    var ap = coalbedo(g, T);
    var Qeq = (A + B * T) / ap;
    return Qeq;
}
