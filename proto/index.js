const MAIN_MOUSE_BUTTON = 0;

let mode = "touch"

let lb_pressure = document.getElementById("lb_pressure")
let lb_btype = document.getElementById("lb_btype")

let btnMode = document.getElementById("btnMode")
let btnClear = document.getElementById("btnClear");

let theCanvas = document.getElementById("myDraw");
let theContext = prepareContext(theCanvas);
let shouldDraw = false;

theCanvas.addEventListener("pointerdown", start);
theCanvas.addEventListener("pointerup", end);
theCanvas.addEventListener("pointermove", move, false);

btnClear.addEventListener("click", event => {
  clearCanvas(theContext);
});

btnMode.addEventListener("click", (e) => {
  let spMode = document.getElementById("spMode")

  if(spMode.innerHTML == "touch_app") {
    spMode.innerHTML =  "mode"
    mode = "pen"
  } else {
    spMode.innerHTML = "touch_app"
    mode = "touch"
  }
})

// -- HELPERS ---------
function prepareContext() {
  let canvasElement = document.getElementById("myDraw")

  let dpr = window.devicePixelRatio || 1;
  let rect = canvasElement.getBoundingClientRect();
  canvasElement.width = rect.width * dpr;
  canvasElement.height = rect.height * dpr;

  let context = canvasElement.getContext("2d");
  context.scale(dpr, dpr);

  return context;
}

function setLineProperties(context) {
  context.strokeStyle = "#1D1D1B";
  context.lineWidth = 3;
  // context.lineJoin = "round";
  context.lineCap = "round";
  return context;
}

function clearCanvas(context) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function checkInput(event) {
  return event.pointerType != mode && event.pointerType != "mouse"
}

// -- EVENT HANDLERS --------
function start(event) {
  if (checkInput(event)) return

  lb_btype.innerHTML = `buttonType: ${event.button}`

  shouldDraw = true;
  setLineProperties(theContext);

  theContext.beginPath();

  let elementRect = event.target.getBoundingClientRect();
  theContext.moveTo(event.clientX - elementRect.left, event.clientY - elementRect.top);
}

function end(event) {
  if (checkInput(event)) return
  shouldDraw = false;
}

function move(event) {
  if (checkInput(event)) return
  if (shouldDraw) {
    lb_pressure.innerHTML = `pressure ${event.pressure}`

    let elementRect = event.target.getBoundingClientRect();
    theContext.lineTo(event.clientX - elementRect.left, event.clientY - elementRect.top);
    theContext.stroke()
  }
}
