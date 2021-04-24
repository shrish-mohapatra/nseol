'use strict';

(function() {

  var sakura = new Sakura('body', {delay: 1000})

  var socket = io();
  var canvas = document.getElementById('myDraw');
  var context = canvas.getContext('2d');

  let lb_pressure = document.getElementById("lb_pressure")
  let lb_btype = document.getElementById("lb_btype")

  let btnMode = document.getElementById("btnMode")
  let btnClear = document.getElementById("btnClear");
  let btnCopy = document.getElementById("btnCopy");

  var current = {
    color: '#1D1D1B'
  };

  var drawing = false;
  let inputMode = "pen"
  let drawMode = "draw"

  canvas.addEventListener('pointerdown', onMouseDown, false);
  canvas.addEventListener('pointerup', onMouseUp, false);
  canvas.addEventListener('pointerout', onMouseUp, false);
  canvas.addEventListener('pointermove', throttle(onMouseMove, 10), false);

  btnClear.addEventListener("click", event => {
    clearCanvas(context);
    socket.emit('clearCanvas')
  });

  btnMode.addEventListener("click", (e) => {
    let spMode = document.getElementById("spMode")
  
    if(spMode.innerHTML == "touch_app") {
      spMode.innerHTML =  "mode"
      inputMode = "pen"
    } else {
      spMode.innerHTML = "touch_app"
      inputMode = "touch"
    }
  })

  btnCopy.addEventListener("click", (e) => {
    console.log("copy")
    canvas.toBlob(blob => {
      const img = new ClipboardItem({"image/png": blob})
      navigator.clipboard.write([img])
    })
  })

  socket.on('drawing', onDrawingEvent);
  socket.on('clearCanvas', () => clearCanvas(context))

  window.addEventListener('resize', onResize, false);
  onResize();


  function drawLine(x0, y0, x1, y1, color, emit, erase){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;

    if(erase) {
      context.globalCompositeOperation = "destination-out"
      context.lineWidth = 30;  
    } else {
      context.globalCompositeOperation = "source-over"
      context.lineWidth = 2; 
    }

    context.lineJoin = "round";
    context.lineCap = "round";

    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
      erase: erase
    });
  }

  function checkInput(e) {
    return e.pointerType != inputMode && e.pointerType != "mouse"
  }

  function onMouseDown(e){
    if (checkInput(e)) return

    lb_btype.innerHTML = `buttonType: ${e.button}`
    drawMode = e.button == 0 ? "pen" : "erase"

    drawing = true;
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  function onMouseUp(e){
    if (checkInput(e)) return
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true, drawMode == "erase");
  }

  function onMouseMove(e){
    if (checkInput(e)) return
    if (!drawing) { return; }

    lb_pressure.innerHTML = `pressure ${e.pressure}`

    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true, drawMode == "erase");
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, false, data.erase);
  }

  // make the canvas fill its parent
  function onResize() {
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;

    let dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    context.scale(dpr, dpr)
  }

  function clearCanvas(context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

})();