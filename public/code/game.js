//Observe partten
const eventDispatcher = new EventDispatcher();
//Set up Pixi and load the texture atlas files - call the `setup`
//function when they've loaded
PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
let app = new MainScene(590, 960, 0x3FA000)
const tink = new Tink(PIXI, app.view);
document.body.appendChild(app.view);
Helper.scaleToWindow(app.view);
//Const
const enemyManager = new EnemyManager();
const missileFly = new MissileFlyEffect();
const uiManager = new UIManager();
const addPosision = 2;
//Main
//Game variable
let background;
let DELTA_TIME = 1;
let lastTime = 0;
//Load texture
Loader
        .add("public/imgs/bg.jpg")
        .add("public/imgs/tankes.png")
        .add("public/imgs/explosion1.png")
        .add("public/imgs/explosion2.png")
        .add("public/imgs/explosion3.png")
        .add("public/imgs/enemy1.png")
        .add("public/imgs/enemy2.png")
        .add("public/imgs/enemy3.png")
        .add("public/imgs/enemy4.png")
        .add("public/imgs/missile.png")
        .load(setup);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Declare any variables used in more than one function
function setup() {
  //Initialize the game sprites, set the game `state` to `play` and start the 'gameLoop'
  //Enemies
  enemyManager.loadTextures();
  // Create and Set bg
  background = new Background(Loader.resources["public/imgs/bg.jpg"].texture, app.view.width, app.view.height);
  background.render();
  app.stage.addChild(background);
  //Create explosion animation
  missileFly.loadExplosionTextures();
  //Add enemyManager
  app.stage.addChild(enemyManager);
  //Create fly missile
  missileFly.render(app.stage);
  //Add UI
  uiManager.render();
  app.stage.addChild(uiManager);
  //Set pointer
  //set the game state to `play`
  app.state = main;
  //Start the game loop
  gameLoop();
}

function gameLoop() {
  //Runs the current game `state` in a loop and render the sprites
  //Custom delta time
  var time = Date.now();
  var currentTime =  time;
  var passedTime = currentTime - lastTime;

  if(passedTime > 100) passedTime = 100;
  DELTA_TIME = (passedTime * 0.06);
  lastTime = currentTime;

  tink.update();
  app.state();
  requestAnimationFrame(gameLoop);
}

function main() {
  uiManager.waitTapScreen();
}

function play() {
  //All the game logic goes here
  background.update();
  //Move all enemy in enemyManager forward with bg
  enemyManager.update();
  console.log(app.point + " " + app.state)
  if (app.point <= 0) {
    app.state = end;
  }
  //Spawn Enemy
}

function end() {
  console.log("end" + app.point + " " + app.state)
  uiManager.showText("Game Over!!", null, true);
  //All the code that should run at the end of the game goes here
}

function pause() {
    app.ticker.speed = 0;
}
