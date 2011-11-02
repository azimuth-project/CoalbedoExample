void setup() {
    size(COALBEDO_WIDTH, COALBEDO_HEIGHT);
    noLoop();   // turn off animation, since we won't need it
    drawCoalbedo(INIT_GAMMA);
}

void draw() { }  

void drawAxes() {
    float t0 = COALBEDO_T0;
    float t1 = COALBEDO_T1;
    float tRange = t1 - t0;
    float xZero = width * (1.0 - t1 / tRange);
    strokeWeight(1.0);
    stroke(AXES_COLOR);
    line(xZero, 0, xZero, height);
    line(0, height - 1, width, height - 1);    
}

void drawGrid() {
    background(BACKGROUND_COLOR);
    fill(BACKGROUND_COLOR);
    strokeWeight(0.5);
    stroke(GRID_COLOR);
    int xStep = width / 10;
    for (int x=0; x < width; x += xStep) {
        line(x, 0, x, height);
    }
    int yStep = height / 5;
    for (int y=0; y < height; y += yStep) {
        line(0, y, width, y);
    }
}

void drawCoalbedo(float g) {
    drawGrid();
    drawAxes();
    strokeWeight(2.0);
    stroke(COALBEDO_LINE_COLOR);
    float t0 = COALBEDO_T0;
    float t1 = COALBEDO_T1;
    float tRange = t1 - t0;
    for (int x=0; x < width; x++) {
        float fractionAcross = float(x) / width;
        float tCurrent = t0 + fractionAcross * tRange;
        float ap = coalbedo(g, tCurrent);
        int y = height * (1.0 - ap);
        point(x, y);
    }
}
