//Observe partten
// var current_user = null;
const eventDispatcher = new EventDispatcher();
//Set up Pixi and load the texture atlas files - call the `setup`
//function when they've loaded
PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
let app = new MainScene(590, 960, 0x3FA000)
const tink = new Tink(PIXI, app.view);
document.body.appendChild(app.view);
window.addEventListener('resize', resize);
Helper.scaleToWindow(app.view);
//Const
const enemyManager = new EnemyManager();
const missileFly = new MissileFlyEffect();
const uiManager = new UIManager();
const loginScreen = new LoginScreen();
const addPosision = 2;
//Main
//Game variable
let background;
let DELTA_TIME = 1;
let lastTime = 0;
let user = {
  id: 0,
  username: "Guest",
  point: 1000
};
//Load texture
Loader
        .add("public/img/bg.jpg")
        .add("public/img/tankes.png")
        .add("public/img/explosion1.png")
        .add("public/img/explosion2.png")
        .add("public/img/explosion3.png")
        .add("public/img/enemy1.png")
        .add("public/img/enemy2.png")
        .add("public/img/enemy3.png")
        .add("public/img/enemy4.png")
        .add("public/img/missile.png")
        .add("public/img/blackbg.jpg")
        .load(setup);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Declare any variables used in more than one function
function setup() {
  if (current_user != null) {
    user = current_user;
    app.point = user.point
    eventDispatcher.postEvent('ChangeCoinText', "Point: " + app.point);
  }
  //Initialize the game sprites, set the game `state` to `play` and start the 'gameLoop'
  //Enemies
  enemyManager.loadTextures();
  // Create and Set bg
  background = new Background(Loader.resources["public/img/bg.jpg"].texture, app.view.width, app.view.height);
  background.render();
  loginScreen.render();
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
  app.stage.addChild(loginScreen);

  //Set pointer
  //set the game state to `play`
  app.state = pause;
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
  if (app.point <= 0) {
    app.state = end;
  }
  //Spawn Enemy
}

function end() {
  uiManager.showText("Game Over!!", null, true);
  //All the code that should run at the end of the game goes here
}

function pause() {
    app.ticker.speed = 0;
}

function resize() {
  Helper.scaleToWindow(app.view);
}
