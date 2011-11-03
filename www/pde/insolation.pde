void setup() {
    size(INSOLATION_WIDTH, INSOLATION_HEIGHT);
    noLoop();           // turn off animation, since we won't need it
    drawInsolation(INIT_GAMMA);
}

void drawAxes() {
    float t0 = INSOLATION_T0;
    float t1 = INSOLATION_T1;
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

void drawInsolation(float g) {
    drawGrid();
    drawAxes();
    smooth();
    strokeWeight(2.0);
    stroke(INSOLATION_LINE_COLOR);
    float t0 = INSOLATION_T0;
    float t1 = INSOLATION_T1;
    float tRange = t1 - t0;
    noFill();
    beginShape();
    for (int x = 0; x < width; x += 1) {
        float fractionAcross = float(x) / width;
        float tCurrent = t0 + fractionAcross * tRange;
        float q = insolation(g, tCurrent);
        int y = height * (1.0 - q / 600.0);
        vertex(x, y);
    }
    endShape();
}

// draw routine is empty since we aren't animating
void draw() { }
