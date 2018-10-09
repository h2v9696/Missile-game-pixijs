const eventDispatcher = new EventDispatcher();
//Set up Pixi and load the texture atlas files - call the `setup`
//function when they've loaded
PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
let app = new MainScene(590, 960, 0x3FA000)
let tink = new Tink(PIXI, app.view);
document.body.appendChild(app.view);
Helper.scaleToWindow(app.view);
//Main
//Game variable
let state;
let pointer;
let background;
let enemies = new Container();
const timeWaitSpawnEnemy = 120; //About 1/60s so 120 = 2s
const addPosision = 2;
const scaleTimes = 1;
const timeWaitTap = 15;
// let point = 1000;
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
let message;
let group, scroll_group;
let rectangle = new Graphics();
let scrollWidth = app.view.width;
let scrollHeight = 150;
let isLoading = true;
// let currentMissile;
let explosionTextures;
let missileFly;
let missileHit;
let enemyTextures;
let DELTA_TIME = 1;
let lastTime = 0;
let isMissileFlying = false;
let timer = 0;
let isClicked = false;
let countTap = 0;
let isClickedEnemy = false;
let changePoint = function(amount) {
  app.point += amount;
}

let changeCoinText = function(mess) {
  coinText.text = mess;
}

eventDispatcher.registerListeners('ChangePoint', changePoint);
eventDispatcher.registerListeners('ChangeCoinText', changeCoinText);



let enemy = {
  eId: 0,
  kind: "mob",
  health: 5,
  perfectPos: {
    x: 0,
    y: 0,
    radius: 10
  },
  greatPos: {
    x: 0,
    y: 0,
    radius: 40
  },
  goodPos: {
    x: 0,
    y: 0,
    radius: 50
  },
  pointPerfectHit: 70,
  pointGreatHit: 50,
  pointGoodHit: 10,
  sprite: null,
  renderEnemy: function(parent, enemy) {
    let enemyTexture = enemyTextures[Helper.getRandomInteger(0, 4)];
    let e = new Sprite(enemyTexture);
    enemy.sprite = e;
    enemy.perfectPos.x = Helper.getRandomInteger(e.width - 3 * e.width / 4, e.width - e.width / 4);
    enemy.perfectPos.y = Helper.getRandomInteger(e.height - 3 * e.height / 4, e.height - e.height / 4);
    enemy.greatPos.x = enemy.perfectPos.x - 10;
    enemy.greatPos.y = enemy.perfectPos.y - 10;

    enemy.goodPos.x = e.width / 2;
    enemy.goodPos.y = e.height / 2;
    enemy.goodPos.radius = e.width / 2;
    //Set random position in horizon
    e.x = Helper.getRandomInteger(0, app.view.width - e.width);
    e.y = - e.height * scaleTimes;
    //Draw circle
    // let perfectCircle = new Graphics();
    // perfectCircle.beginFill(0xff0000);
    // perfectCircle.drawCircle(e.getGlobalPosition().x + enemy.perfectPos.x, e.getGlobalPosition().y + enemy.perfectPos.y, enemy.perfectPos.radius);
    // perfectCircle.alpha = 0.3;
    // perfectCircle.endFill();

    // let greatCircle = new Graphics();
    // greatCircle.beginFill(0xa2ff00);
    // greatCircle.drawCircle(e.getGlobalPosition().x + enemy.greatPos.x, e.getGlobalPosition().y + enemy.greatPos.y, enemy.greatPos.radius);
    // greatCircle.alpha = 0.3;
    // greatCircle.endFill();

    // let goodCircle = new Graphics();
    // goodCircle.beginFill(0x00c6ff);
    // goodCircle.drawCircle(e.getGlobalPosition().x + enemy.goodPos.x, e.getGlobalPosition().y + enemy.goodPos.y, enemy.goodPos.radius);
    // goodCircle.alpha = 0.3;
    // goodCircle.endFill();
    //Set scale enemy (will hange later)
    e.scale.x = scaleTimes;
    e.scale.y = scaleTimes;
    //Enemy Heath
    // enemy.health = enemyMaxHealth;
    // enemy.healthText = new Text("Health: " + enemy.health, {fontSize: 20, fill: "red", align: "center"});
    // enemy.healthText.x = enemy.x - enemy.healthText.width / 2 + enemy.width / 2;
    // enemy.healthText.y = enemy.y - enemy.healthText.height;
    enemy.score = enemy.pointGoodHit;

    e.interactive = true;
    e.hitArea = TransparencyHitArea.create(e);
    // e.on("tap", function(e){ // Mobile test
    e.on("pointertap", function(event){
      isClickedEnemy = true;
      if (isMissileFlying) return;
      //handle double click enemy
      if (!isClicked) {
        isClicked = true;
        app.ticker.add(tapHandler = function(delta) {

          timer += delta;
          if (timer >= timeWaitTap) {
            isClicked = false;
            timer = 0;
            app.ticker.remove(tapHandler);
            countTap = 0;
          }
        });
      }
      countTap++;
      if (countTap === 2 && timer < timeWaitTap) {

        let localClickPos = event.data.getLocalPosition(e);
        let clickLocalPosX = localClickPos.x;
        let clickLocalPosY = localClickPos.y;
        let clickPosX = event.data.global.x;
        let clickPosY = event.data.global.y;

        e.interactive = false;

        if (Helper.distanceBetweenPositions(enemy.perfectPos, localClickPos) < enemy.perfectPos.radius) {
          text.text = "Perfect!!! ";
          enemy.score = enemy.pointPerfectHit;
        } else if (Helper.distanceBetweenPositions(enemy.greatPos, localClickPos) < enemy.greatPos.radius) {
          text.text = "Great!! ";
          enemy.score = enemy.pointGreatHit;
        } else if (Helper.distanceBetweenPositions(enemy.goodPos, localClickPos) < enemy.goodPos.radius) {
          text.text = "Good! ";
          enemy.score = enemy.pointGoodHit;
        }

        if (app.point >= app.currentMissile.pointPerShoot) {
          app.point -= app.currentMissile.pointPerShoot;
          coinText.text = "Point: " + app.point;
          //Stop scroll
          state = pause;
          missileFly.visible = true;
          isMissileFlying = true;
          //Random fire spot
          // let fireSpotX = getRandomInteger(e.x + missileFly.width / 2, e.x + e.width - missileFly.width / 2);
          missileFly.x = clickPosX;
          app.ticker.add(missileFlyHandler = function(delta) {
            // let fireSpotY = getRandomInteger(e.y + 10, e.y + e.height - 10);
            if (missileFly.y > clickPosY)
              missileFly.y -= addPosision * 8 * DELTA_TIME;
            else {
              app.ticker.remove(missileFlyHandler);
              missileHit.x = missileFly.x - missileHit.width / 2;
              missileHit.y = missileFly.y - missileHit.height / 2;
              missileFly.visible = false;
              isMissileFlying = false;
              missileFly.y = app.view.height - 100;
              // missileHit.x = e.x - e.width / 2;
              // missileHit.y = e.y - e.eheight / 2;

              missileHit.visible = true;
              Helper.wait(100).then(() => {
                missileHit.visible = false;
                // enemy.health -= app.currentMissile.damage;
                //Enemy death
                // if (enemy.health <= 0 ) {
                //   enemyDeath(enemy);
                // }
                // enemyDeath(enemy, perfectCircle, greatCircle, goodCircle);
                enemyDeath(enemy);
                isClicked = false;
                timer = 0;
                app.ticker.remove(tapHandler);
                countTap = 0;
                isClickedEnemy = false;

                // e.healthText.text = "Health: " + enemy.health;
                app.ticker.speed = 1;
                // e.interactive = true;
                state = play;
                app.ticker.remove(missileFlyHandler);
              });
            }
          });

        } else {
          app.showAlert("Not enough point to fire!");
        }
      }
    });
    parent.addChild(e);
    // parent.addChild(goodCircle);
    // parent.addChild(greatCircle);
    // parent.addChild(perfectCircle);
    // enemies.addChild(e.healthText);
  }
};
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
  //Enemies texture
  enemyTextures = [
    Loader.resources["public/imgs/enemy1.png"].texture,
    Loader.resources["public/imgs/enemy2.png"].texture,
    Loader.resources["public/imgs/enemy3.png"].texture,
    Loader.resources["public/imgs/enemy4.png"].texture
  ];
  // Create and Set bg
  background = new TilingSprite(Loader.resources["public/imgs/bg.jpg"].texture, app.view.width, app.view.height);
  background.x = 0;
  background.y = 0;
  background.interactive = true;
  background.on("pointertap", function(event){
    if (isClickedEnemy) return;
    // event.stopPropagation();
    if (isMissileFlying) return;
    //handle double click enemy
    if (!isClicked) {
      isClicked = true;
      app.ticker.add(tapHandler = function(delta) {

        timer += delta;
        if (timer >= timeWaitTap) {
          isClicked = false;
          timer = 0;
          app.ticker.remove(tapHandler);
          countTap = 0;
        }
      });
    }
    countTap++;
    if (countTap === 2 && timer < timeWaitTap) {

      let clickPosX = event.data.global.x;
      let clickPosY = event.data.global.y;

      background.interactive = false;
      if (app.point >= app.currentMissile.pointPerShoot) {
        app.point -= app.currentMissile.pointPerShoot;
        coinText.text = "Point: " + app.point;
        //Stop scroll
        state = pause;
        missileFly.visible = true;
        isMissileFlying = true;
        //Random fire spot
        // let fireSpotX = getRandomInteger(e.x + missileFly.width / 2, e.x + e.width - missileFly.width / 2);
        missileFly.x = clickPosX;
        app.ticker.add(missileFlyHandler = function(delta) {
          // let fireSpotY = getRandomInteger(e.y + 10, e.y + e.height - 10);
          if (missileFly.y > clickPosY)
            missileFly.y -= addPosision * 8 * DELTA_TIME;
          else {
            missileHit.x = missileFly.x - missileHit.width / 2;
            missileHit.y = missileFly.y - missileHit.height / 2;
            missileFly.visible = false;
            isMissileFlying = false;
            missileFly.y = app.view.height - 100;
            // missileHit.x = e.x - e.width / 2;
            // missileHit.y = e.y - e.eheight / 2;

            missileHit.visible = true;
            Helper.wait(100).then(() => {
              missileHit.visible = false;
              // enemy.health -= app.currentMissile.damage;
              //Enemy death
              // if (enemy.health <= 0 ) {
              //   enemyDeath(enemy);
              // }
              // enemyDeath(enemy, perfectCircle, greatCircle, goodCircle);

              text.text = "Missed!!";
              //Update text pos
              showText();

              isClicked = false;
              timer = 0;
              app.ticker.remove(tapHandler);
              countTap = 0;
              // e.healthText.text = "Health: " + enemy.health;
              app.ticker.speed = 1;
              background.interactive = true;

              // e.interactive = true;
              state = play;
              app.ticker.remove(missileFlyHandler);
            });
          }
        });

      } else {
        app.showAlert("Not enough point to fire!\nChange your missile!");
      }
    }
  });
  app.stage.addChild(background);

  //Create explosion animation
  explosionTextures = [
    Loader.resources["public/imgs/explosion1.png"].texture,
    Loader.resources["public/imgs/explosion2.png"].texture,
    Loader.resources["public/imgs/explosion3.png"].texture,
  ];

  //Add enemies
  app.stage.addChild(enemies);
  //Create fly missile
  missileFly = new Sprite(Loader.resources["public/imgs/missile.png"].texture);
  missileFly.y = app.view.height - 100;
  missileFly.x = 0;
  missileFly.width = 23.6;
  missileFly.height = 192;
  missileFly.visible = false;
  missileHit = new Sprite(Loader.resources["public/imgs/explosion1.png"].texture);
  missileHit.width = 128;
  missileHit.height = 128;
  missileHit.visible = false;
  app.stage.addChild(missileFly);
  app.stage.addChild(missileHit);
  //Set text
  text.x = app.view.width / 2 - text.width / 2;
  text.y = app.view.height / 2 - text.height / 2;
  coinText.x = 5;
  coinText.y = 0;
  app.alertText.x = app.view.width / 2 - app.alertText.width / 2;
  app.alertText.y = coinText.height + 5;
  coinText.text = "Point: " + app.point;
  app.stage.addChild(text);
  app.stage.addChild(coinText);
  app.stage.addChild(app.alertText);
  //Spawn enemy
  //Set pointer
  pointer = tink.makePointer();
  //set the game state to `play`
  state = main;
  text.visible = true;
  textEffect(text, 30);
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
  //     if (state !== pause) {
  //       pauseBtn.label = "RESUME";
  //       state = pause;
  //     }
  //     else {
  //       prePlay();
  //       state = play;
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
  state();
  requestAnimationFrame(gameLoop);
}

function main() {
  coinText.visible = false;
  if (!isLoading) {
    text.text = "Tap to start!";
    pointer.tap = () => {
        prePlay();
        state = play;
    }
  } else text.text = "Loading...";
}

function prePlay() {
  rectangle.visible = true;
  app.ticker.remove(textHandler);
  text.visible = false;
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
  text.text = "Game Over!!"
  //Update text pos
  text.x = app.view.width / 2 - text.width / 2;
  text.y = app.view.height / 2 - text.height / 2;
  text.visible = true;
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
      let e = Object.create(enemy);
      e.renderEnemy(enemies, e);
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

//Enemy death handler
function enemyDeath(enemy/*, perfectCircle, greatCircle, goodCircle*/) {
  //Set death animation
  let explosionAnimation = new AnimatedSprite(explosionTextures);
  explosionAnimation.animationSpeed = 0.15
  // explosionAnimation.width = 128;
  // explosionAnimation.height = 128;
  explosionAnimation.loop = false;
  explosionAnimation.visible = false;
  explosionAnimation.pivot.x = 0.5;
  explosionAnimation.pivot.y = 0.5;
  explosionAnimation.scale.x = 0.7;
  explosionAnimation.scale.y = 0.7;

  enemy.sprite.removeAllListeners();

  let multipler = 1;
  let i = Helper.getRandomInteger(1, 100);
  text.text += "+" + enemy.score;
  if (i < 2)
  {
    multipler = 10;
  } else if (i < 5)
  {
    multipler = 2;
  }
  if (multipler > 1)
    text.text += "\nScore x " + multipler + "!!";
  showText();

  app.point += enemy.score * multipler;
  coinText.text = "Point: " + app.point;
  enemies.removeChild(enemy.sprite);
  // enemies.removeChild(perfectCircle);
  // enemies.removeChild(greatCircle);
  // enemies.removeChild(goodCircle);

  explosionAnimation.position.set(enemy.sprite.x, enemy.sprite.y);
  enemies.addChild(explosionAnimation);
  explosionAnimation.visible = true;
  explosionAnimation.play();
  // enemy.health = 0;
  // enemy.healthText.visible = false;
}

function showText() {
  text.x = app.view.width / 2 - text.width / 2;
  text.y = app.view.height / 2 - text.height / 2;
  text.visible = true;
  Helper.wait(500).then(() => {text.visible = false;});
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
