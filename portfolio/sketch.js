console.log('p five')


function setup() {
   let can =  createCanvas(400, 400);
  can.parent("body")
  }
  
  function draw() {
    // background(220); // Light gray background
  
    rect(50, 50, 100, 50); // Rectangle
    ellipse(200, 100, 80, 80); // Circle
    line(100, 150, 300, 200); // Line
    triangle(350, 50, 300, 100, 380, 100); // Triangle
    point(200, 200); // Point
  }

