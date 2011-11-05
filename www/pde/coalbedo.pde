void setup() {
    String id = externals.canvas.id;
    int w = int(canvasWidth(id));
    int h = int(canvasHeight(id));
    size(w, h);
    noLoop();   // turn off animation, since we won't need it
    String g = currentGamma();
    float initGamma = g=="0" ? 0.0 : float(g);  // this one was fun to track down
    drawInit(id, initGamma);
}

void drawInit(String id, float g) {
    if (id.startsWith("coalbedo")) {
        drawCoalbedo(g);
    } else if (id.startsWith("insolation")) {
        drawInsolation(g);
    } else if (id.startsWith("temperature")) {
        drawTemperature(g);
    }
}

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

void drawGrid(int xDivisions, int yDivisions) {
    background(BACKGROUND_COLOR);
    strokeWeight(0.5);
    stroke(GRID_COLOR);
    int xStep = width / xDivisions;
    int yStep = height / yDivisions;
    for (int x=0; x < width; x += xStep) {
        line(x, 0, x, height);
    }
    for (int y=0; y < height; y += yStep) {
        line(0, y, width, y);
    }
}

void drawCoalbedo(float g) {
    drawGrid(10, 5);
    drawAxes();
    smooth();
    strokeWeight(2.0);
    stroke(COALBEDO_LINE_COLOR);
    float t0 = COALBEDO_T0;
    float t1 = COALBEDO_T1;
    float tRange = t1 - t0;
    noFill();
    beginShape();
    for (int x=0; x < width; x++) {
        float fractionAcross = float(x) / width;
        float tCurrent = t0 + fractionAcross * tRange;
        float ap = coalbedo(g, tCurrent);
        int y = height * (0.8 - ap);
        vertex(x, y);
    }
    endShape();
}

void drawInsolation(float g) {
    drawGrid(10, 5);
    drawAxes();
    smooth();
    strokeWeight(2.0);
    stroke(INSOLATION_LINE_COLOR);
    float t0 = INSOLATION_T0;
    float t1 = INSOLATION_T1;
    float tRange = t1 - t0;
    float tStep = tRange / width;
    noFill();
    beginShape();
    for (float t = t0; t < t1; t += tStep) {
        float q = insolation(g, t);
        int x = width * (t - t0) / tRange;
        int y = height * (1.0 - q / 600.0);
        vertex(x, y);
    }
    endShape();
}

void drawTemperature(float g) {
    drawGrid(10, 10);
    smooth();
    strokeWeight(2.0);
    stroke(TEMPERATURE_LINE_COLOR);
    float t0 = TEMPERATURE_T0;
    float t1 = TEMPERATURE_T1;
    float tRange = t1 - t0;
    float tStep = tRange / width;
    noFill();
    beginShape();
    for (float t = t0; t < t1; t += tStep) {
        float q = insolation(g, t);
        int x = width * (q - 200.0) / 300.0;
        int y = height * (1.0 - (t - t0) / tRange);
        vertex(x, y);
    }
    endShape();
}

void draw() { }  
