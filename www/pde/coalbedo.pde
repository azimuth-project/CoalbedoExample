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

/*void drawText(String t) {
    background(#000033);  
    // get the width for the text  
    float twidth = textWidth(t);           
    // place the text centered on the drawing area  
    text(t, (width - twidth)/2, height/2);     
}
*/

void drawCoalbedo(float ti, float tf, float g) {
    background(#000033);
    // get the range of temperatures we are charting  
    float tRange = tf - ti;
    for (int x=0; x < width; x++) {
        float fractionAcross = float(x) / width;
        float tCurrent = ti + fractionAcross * tRange;
        float ap = coalbedo(g, tCurrent);
        int y = height - ap * height;
        point(x, y);
    }
}
