//Observe partten
const eventDispatcher = new EventDispatcher();
const enemyManager = new EnemyManager();
const missileFly = new MissileFlyEffect();
//Set up Pixi and load the texture atlas files - call the `setup`
//function when they've loaded
PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
let app = new MainScene(590, 960, 0x3FA000)
let tink = new Tink(PIXI, app.view);
document.body.appendChild(app.view);
Helper.scaleToWindow(app.view);
//Main
//Game variable
// let state;
let pointer;
let background;
let enemies = new Container();
const timeWaitSpawnEnemy = 120; //About 1/60s so 120 = 2s
const addPosision = 2;
// const scaleTimes = 1;
// const timeWaitTap = 15;
// const enemyMaxHealth = 5;
// const coinPerEnemy = 10;
let textHandler;
let spawnHandler;
let text = new Text("Tap to start!", {
  fontSize: 80, align: "center",
  wordWrap: true, wordWrapWidth: app.view.width,
  stroke: "white", strokeThickness: 4
});
let coinText = new Text("", {fontSize: 40, stroke: "white", strokeThickness: 4});
let group, scroll_group;
let rectangle = new Graphics();
let scrollWidth = app.view.width;
let scrollHeight = 150;
let isLoading = true;
let DELTA_TIME = 1;
let lastTime = 0;

let changePoint = function(amount) {
  app.point += amount;
}

let changeCoinText = function(mess) {
  coinText.text = mess;
}

eventDispatcher.registerListeners('ChangePoint', changePoint);
eventDispatcher.registerListeners('ChangeCoinText', changeCoinText);

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
  //Initialize the game sprites, set the game `state` to `play`
  //and start the 'gameLoop'
  //Enemies
  enemyManager.loadTextures();
  // Create and Set bg
  background = new TilingSprite(Loader.resources["public/imgs/bg.jpg"].texture, app.view.width, app.view.height);
  background.x = 0;
  background.y = 0;
  background.interactive = true;
  background.on("pointertap", function(event){
    if (app.isClickedEnemy) return;
    // event.stopPropagation();
    if (missileFly.isMissileFlying) return;
    //handle double click
    if (app.isDoubleTap()) {
      let clickPosX = event.data.global.x;
      let clickPosY = event.data.global.y;

      background.interactive = false;
      missileFly.shootMissile(() => {
        app.mainText.text = "Missed!!";
        //Update text pos
        app.showText(() => {
          background.interactive = true;
        });
      }, clickPosX, clickPosY);
    }
  });
  app.stage.addChild(background);
  //Create explosion animation
  missileFly.loadExplosionTextures();
  //Add enemies
  app.stage.addChild(enemies);
  // //Create fly missile
  missileFly.render(app.stage);
  //Set text
  app.mainText.x = app.view.width / 2 - app.mainText.width / 2;
  app.mainText.y = app.view.height / 2 - app.mainText.height / 2;
  coinText.x = 5;
  coinText.y = 0;
  app.alertText.x = app.view.width / 2 - app.alertText.width / 2;
  app.alertText.y = coinText.height + 5;
  coinText.text = "Point: " + app.point;
  app.stage.addChild(app.mainText);
  app.stage.addChild(coinText);
  app.stage.addChild(app.alertText);
  //Spawn enemy
  //Set pointer
  pointer = tink.makePointer();
  //set the game state to `play`
  app.state = main;
  app.mainText.visible = true;
  textEffect(app.mainText, 30);
  app.alertText.visible = false;
  //Setup scroll
  rectangle.beginFill(0x000000);
  rectangle.lineStyle(4, 0x000000, 1);
  rectangle.drawRect(0, 0, scrollWidth - 4, scrollHeight + 10);
  rectangle.x = 2;
  rectangle.y = app.view.height - scrollHeight - 10;
  rectangle.interactive = true;
  rectangle.endFill();
  rectangle.visible = false;
  app.stage.addChild(rectangle);
  //Load theme gown
  var theme = new GOWN.ThemeParser("public/libs/gown/docs/themes/assets/aeon_desktop/aeon_desktop.json");
  theme.once(GOWN.Theme.COMPLETE, onComplete, this);
  GOWN.loader.load();
  // pauseBtn = new GOWN.Button(theme);
  //   pauseBtn.width = 150;
  //   pauseBtn.height = 100;
  //   pauseBtn.x = 20;
  //   pauseBtn.y = 30;
  //   pauseBtn.label = "PAUSE";

  //   pauseBtn.on(GOWN.Button.TRIGGERED, function () {
  //     if (app.app.app.state !== pause) {
  //       pauseBtn.label = "RESUME";
  //       app.app.state = pause;
  //     }
  //     else {
  //       prePlay();
  //       app.state = play;
  //       pauseBtn.label = "PAUSE";
  //     }
  //   });
  // app.stage.addChild(pauseBtn);

  //Current missile = default missile
  //Start the game loop
  gameLoop();
}

function gameLoop() {
  //Runs the current game `state` in a loop and render the sprites
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
  coinText.visible = false;
  if (!isLoading) {
    app.mainText.text = "Tap to start!";
    pointer.tap = () => {
        prePlay();
        app.state = play;
    }
  } else app.mainText.text = "Loading...";
}

function prePlay() {
  rectangle.visible = true;
  app.ticker.remove(textHandler);
  app.mainText.visible = false;
  coinText.visible = true;
  spawnEnemies(timeWaitSpawnEnemy);
  scroll_group.visible = true;
  pointer.tap = null;
}

function play() {
  //All the game logic goes here
  background.tilePosition.y += addPosision * DELTA_TIME;
  background.tilePosition.y %= background.texture.orig.height;
  //Move all enemy in enemies forward with bg
  enemies.children.some(enemy => {
    enemy.y += addPosision * DELTA_TIME; //Add equal to background so it's move along with bg
    //Destroy enemy when out of screen
    if (enemy.y > app.view.height + 300) {
      enemies.removeChild(enemy);
    }
  });
  // coinText.text = "Point: " + app.point;
  if (app.point === 0) {
    state = end;
  }
  //Spawn Enemy
}

function end() {
  app.mainText.text = "Game Over!!"
  //Update text pos
  app.mainText.x = app.view.width / 2 - app.mainText.width / 2;
  app.mainText.y = app.view.height / 2 - app.mainText.height / 2;
  app.mainText.visible = true;
  //All the code that should run at the end of the game goes here
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Game func
//Complete load gown theme and gen UI
function onComplete() {
  group = new GOWN.LayoutGroup();
  group.layout = new GOWN.layout.HorizontalLayout();
  scroll_group = new GOWN.ScrollContainer();
  scroll_group.x = 10;
  scroll_group.y = app.view.height - scrollHeight;
  scroll_group._useMask = false;
  scroll_group.height = scrollHeight - 10;
  scroll_group.width = scrollWidth - 20;
  // create layout container and add some buttons
  for (var i = 0; i < 10; i++) {
      let missile = new Missile();
      //First missile
      if (i !== 0)
      {
        missile = new Missile(i+1, 0, "Kind" + i, true, i * 500, i * 20);
      } else {
        app.currentMissile = missile;
      }
      missile.render(group, missile);
      if (i < 10 - 1)
        group.addSpacer(10);
  }
  scroll_group.viewPort = group;
  scroll_group.visible = false;
  app.stage.addChild(scroll_group);
  isLoading = false;
}

function pause() {
    app.ticker.speed = 0;
}
//Execute a function in a short of time and loop with update
function spawnEnemies(time) {
  let countTime = time;
  app.ticker.add(spawnHandler = function(delta) {
    //Countdown time to spawn
    if (countTime < 0) {
      let enemy = new Enemy();
      enemy.render(enemies);
      countTime = time;
    } else {
      //delta is time value from last frame to this frame
      countTime -= delta;
    }
  });
}
//Start text effect
function textEffect(text, time) {
  let countTime = time;
  app.ticker.add(textHandler = function(delta) {
    //Countdown time to spawn
    if (countTime < 0) {
      text.visible = false;
      Helper.wait(250).then(() => countTime = time);
    } else {
      //delta is time value from last frame to this frame
      countTime -= delta;
      text.visible = true;
    }
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
