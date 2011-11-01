void setup() {  
    size(200,200);  
    noLoop();                        // turn off animation, since we won't need it  
    stroke(#FFEE88);  
    fill(#FFEE88);  
    background(#000033);  
    text("",0,0);                    // force Processing to load a font  
    textSize(24);                    // set the font size to something big  
}  

void draw() { }  

void drawInsolation(float ti, float tf, float g) {
    background(#000033);
    float tRange = tf - ti;
    for (int x=0; x < width; x++) {
        float fractionAcross = float(x) / width;
        float tCurrent = ti + fractionAcross * tRange;
        float q = insolation(g, tCurrent);
        int y = height - q * height / 1000.0;
        point(x, y);
    }
}
