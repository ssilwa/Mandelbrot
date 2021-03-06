// The function gets called when the window is fully loaded
window.onload = function() {
    // Prompt user for degree
    // var degree = parseInt(prompt("What degree equation to use?"));

    // Get the canvas and context
    var canvas = document.getElementById("canvas"); 
    var context = canvas.getContext("2d");

    // Second canvas for rectangle
    var canvas2 = document.getElementById("canvas2"); 
    var context2 = canvas2.getContext("2d");

    // Define heights to fill page
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    canvas2.width = window.innerWidth;

    // Rectangle canvas settings
    context2.strokeStyle="#0000FF";
    context2.lineWidth=2;
    // context2.setLineDash([5, 3])
    rect = {};
    drag = false;
 
    // Define constants
    var width = canvas.width;
    var height = canvas.height;
    var N_r = -2.5;
    var M_r = (2.5-N_r)/width; //-N_r/Math.floor(width/2.0);
    var N_i = 1.5;
    var M_i = -M_r;//-N_i/Math.floor(height/2.0);
    var palette = [];
    var large_palette = [];
 
    // Create an ImageData object
    var imagedata = context.createImageData(width, height);

    // Complex multiplication
    function complex_mult(a, b, c, d){
        return [a*c-b*d, c*b+a*d];
    }

    // Complex powers
    function complex_power(a_r, a_i, n){
        if(n==1){
            return [a_r, a_i];
        }
        else if (n ==2){
            return [a_r*a_r - a_i*a_i, a_r*a_i + a_r*a_i];
        }
        else{
            prev_result = complex_power(a_r, a_i, n-1);
            curr_a_r = prev_result[0];
            curr_a_i = prev_result[1];
            return complex_mult(curr_a_r, curr_a_i, a_r, a_i);
        }

    }

    // Generate color pallette
    function generatePalette() {
        // Calculate a gradient
        var roffset = 24;
        var goffset = 16;
        var boffset = 0;
        for (var i=0; i<256; i++) {
            palette[i] = [roffset, goffset, boffset];
            
            if (i < 64) {
                roffset += 3;
            } else if (i<128) {
                goffset += 3;
            } else if (i<192) {
                boffset += 3;
            }
        }
    }
    function generatelarge_Palette() {
        // Calculate a gradient
        var roffset = 24;
        var goffset = 16;
        var boffset = 0;
        for (var i=0; i<2048; i++) {
            large_palette[i] = [roffset, goffset, boffset];
            
            if (i < 64) {
                roffset += 7;
            } else if (i<128) {
                goffset += 7;
            } else if (i<192) {
                boffset += 5;
            }
        }
    }

    generatePalette();
    generatelarge_Palette();

    // Mandelbrot function
    function mandelbrot(c_r, c_i, maxiter){
        var z_r = 0;
        var z_i = 0;
        var color = [0,0,0];
        var iter = 0;
        while (z_r*z_r + z_i*z_i <= 4 && iter < maxiter){
            var new_z_r = z_r*z_r - z_i*z_i + c_r;
            var new_z_i = z_r*z_i + z_r*z_i + c_i;
            z_r = new_z_r;
            z_i = new_z_i;
            iter ++;
        }
        var index = Math.floor((iter / (maxiter)) * 255);
        if (maxiter = 2048){
            color = large_palette[index];
        }
        else{
            color = palette[index];
        }
        return color;
    }

 
    // Create the image
    function createImage(M_r, M_i, N_r, N_i, maxiter) {
        // Loop over all of the pixels
        for (var x=0; x<width; x++) {
            for (var y=0; y<height; y++) {
                // Get the pixel index
                var pixelindex = (y * width + x)*4;
                // Convert pixels -> complex numbers
                c_r = M_r*x+N_r;
                c_i = M_i*y+N_i;
                // Get number of iterations
                color_value = mandelbrot(c_r, c_i, maxiter);
                // Set pixel value
                imagedata.data[pixelindex] = color_value[0];     // Red
                imagedata.data[pixelindex+1] = color_value[1]; // Green
                imagedata.data[pixelindex+2] = color_value[2];  // Blue
                imagedata.data[pixelindex+3] = 255;   // Alpha
            }
        }
    }

    // Mouse interaction functions
    function init() {
      canvas2.addEventListener('mousedown', mouseDown, false);
      canvas2.addEventListener('mouseup', mouseUp, false);
      canvas2.addEventListener('mousemove', mouseMove, false);
    }

    function mouseDown(e) {
      rect.startX = e.pageX - this.offsetLeft;
      rect.startY = e.pageY - this.offsetTop;
      drag = true;
    }

    function mouseUp() {
      drag = false;
      var upperLeft_r = rect.startX*M_r + N_r;
      var upperLeft_i = rect.startY*M_i + N_i;
      var lowerRight_r = (rect.startX + rect.w)*M_r + N_r;
      var lowerRight_i = (rect.startY + rect.h)*M_i + N_i;
      N_r = upperLeft_r;
      M_r = (lowerRight_r - N_r)/width;
      N_i = upperLeft_i;
      M_i = (lowerRight_i - N_i)/height;
      if (Math.abs(M_r) > Math.abs(M_i)){
        M_i = -M_r;
      }
      else{
        M_r = -M_i;
      }
      createImage(M_r, M_i, N_r, N_i, 2048);
      // context.putImageData(imagedata, 0, 0);
      context2.clearRect(0, 0, canvas2.width, canvas2.height);

    }

    function mouseMove(e) {
      if (drag) {
        rect.w = (e.pageX - this.offsetLeft) - rect.startX;
        rect.h = (e.pageY - this.offsetTop) - rect.startY ;
        context2.clearRect(0,0,canvas2.width,canvas2.height);
        draw();
      }
    }

    function draw() {
      context2.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
    }

    // Main loop
    function main(tframe) {
         // Create the image
        createImage(M_r, M_i, N_r, N_i, 256);
 
        // Draw the image data to the canvas
        context.putImageData(imagedata, 0, 0);
    }
 
    // Call the main loop
    main(0);
    init();
};

