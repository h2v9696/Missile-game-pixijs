if (!document.__defineGetter__) {
    Object.defineProperty(document, 'cookie', {
        get: function(){return ''},
        set: function(){return true},
    });
} else {
    document.__defineGetter__("cookie", function() { return '';} );
    document.__defineSetter__("cookie", function() {} );
}
//Set up Pixi and load the texture atlas files - call the `setup`
//function when they've loaded
PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
let app = new PIXI.Application(590, 960, {backgroundColor : 0x3FA000}, {legacy : true});
document.body.appendChild(app.view);
scaleToWindow(app.view);
let tink = new Tink(PIXI, app.view);
//Alias name
let Loader = PIXI.loader;
let Sprite = PIXI.Sprite;
let Texture = PIXI.Texture;
let TilingSprite = PIXI.extras.TilingSprite;
let TextureCache = PIXI.utils.TextureCache;
let Rectangle = PIXI.Rectangle;
let Text = PIXI.Text;
let Container = PIXI.Container;
let Graphics = PIXI.Graphics;
let AnimatedSprite = PIXI.extras.AnimatedSprite;
let InteractionManager = PIXI.interaction.InteractionManager;
let TransparencyHitArea = PIXI.TransparencyHitArea;
//Game variable
let state;
let pointer;
let background;
let enemies = new Container();
let timeWaitSpawnEnemy = 120; //About 1/60s so 120 = 2s
let addPosision = 2;
let scaleTimes = 1;
let timeWaitTap = 15;
let point = 1000;
let enemyMaxHealth = 5;
let coinPerEnemy = 10;
let textHandler;
let spawnHandler;
let text = new Text("Tap to start!", {
  fontSize: 80, align: "center",
  wordWrap: true, wordWrapWidth: app.view.width,
  stroke: "white", strokeThickness: 4
});
let alertText = new Text("Not enough point to unlock!", {fontSize: 30, fill: "red", align: "center", stroke: "white", strokeThickness: 4});
let coinText = new Text("", {fontSize: 40, stroke: "white", strokeThickness: 4});
let message;
let group, scroll_group;
let rectangle = new Graphics();
let scrollWidth = app.view.width;
let scrollHeight = 150;
let isLoading = true;
let currentMissile;
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

let missile = {
  mId: 0,
  damage: 1,
  kind: "bam",
  isLocked: false,
  pointNeededToUnlock: 0,
  pointPerShoot: 1,
  missileText: null,
  renderMissile: function(parent, missile) {
    let mContainer = new Container();
    let m = new Sprite(
      frame("public/imgs/tankes.png", 128, 64, 32, 32)
    );
    let locker = new Sprite(
      frame("public/imgs/tankes.png", 224, 64, 32, 32)
    );
    let pointPerShootText = new Text(missile.pointPerShoot + "P", {fontSize: 30, align: "center"});
    // let damageText = new Text(missile.damage + "D", {fontSize: 20, align: "center"});

    missile.missileText = new Text("" + missile.pointNeededToUnlock + "P", {fontSize: 30, fill: "white"});
    pointPerShootText.visible = false;
    // damageText.visible = false;
    m.alpha = 0.5;
    if (!missile.isLocked) {
      locker.visible = false;
      m.alpha = 1;
    }
    if (currentMissile.mId === missile.mId) {
      missile.missileText.visible = true;
      pointPerShootText.visible = true;
      // damageText.visible = true;
      missile.missileText.text = "Selected";
    }
    m.interactive = true;
    m.height = scroll_group.height - missile.missileText.height;
    m.width = 150;
    missile.missileText.x = m.x + m.width / 2 - missile.missileText.width / 2;
    missile.missileText.y = scroll_group.height - missile.missileText.height;
    locker.scale.x = 2;
    locker.scale.y = 2;
    locker.x = m.x + m.width / 2 - locker.width / 2;
    locker.y = m.y + m.height / 2 - locker.height / 2;


    pointPerShootText.x = m.x;
    // damageText.x = m.width - damageText.width;
    // damageText.y = pointPerShootText.y + pointPerShootText.height;

    m.on("pointertap", function(e){
      if (currentMissile.damage === missile.damage) return;
      if (missile.isLocked) {
        if (missile.pointNeededToUnlock < point) {
          point -= missile.pointNeededToUnlock;
          coinText.text = "Point: " + point;
          missile.isLocked = false;
          locker.visible = false;
          m.alpha = 1;
          pointPerShootText.visible = true;
          // damageText.visible = true;
          missile.missileText.visible = false;
        } else {
          showAlert("Not enough point to unlock!");
        }
      } else {
        currentMissile.missileText.visible = false;
        currentMissile = missile;
        currentMissile.missileText.text = "Selected";
        missile.missileText.x = m.x + m.width / 2 - missile.missileText.width / 2;
        currentMissile.missileText.visible = true;
      }
    });
    mContainer.addChild(m);
    mContainer.addChild(locker);
    mContainer.addChild(pointPerShootText);
    // mContainer.addChild(damageText);
    mContainer.addChild(missile.missileText);

    parent.addChild(mContainer);
  }
};
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
    let enemyTexture = enemyTextures[getRandomInteger(0, 4)];
    let e = new Sprite(enemyTexture);
    enemy.sprite = e;
    enemy.perfectPos.x = getRandomInteger(e.width - 3 * e.width / 4, e.width - e.width / 4);
    enemy.perfectPos.y = getRandomInteger(e.height - 3 * e.height / 4, e.height - e.height / 4);
    enemy.greatPos.x = enemy.perfectPos.x - 10;
    enemy.greatPos.y = enemy.perfectPos.y - 10;

    enemy.goodPos.x = e.width / 2;
    enemy.goodPos.y = e.height / 2;
    enemy.goodPos.radius = e.width / 2;
    //Set random position in horizon
    e.x = getRandomInteger(0, app.view.width - e.width);
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

        if (distanceBetweenPositions(enemy.perfectPos, localClickPos) < enemy.perfectPos.radius) {
          text.text = "Perfect!!! ";
          enemy.score = enemy.pointPerfectHit;
        } else if (distanceBetweenPositions(enemy.greatPos, localClickPos) < enemy.greatPos.radius) {
          text.text = "Great!! ";
          enemy.score = enemy.pointGreatHit;
        } else if (distanceBetweenPositions(enemy.goodPos, localClickPos) < enemy.goodPos.radius) {
          text.text = "Good! ";
          enemy.score = enemy.pointGoodHit;
        }

        if (point >= currentMissile.pointPerShoot) {
          point -= currentMissile.pointPerShoot;
          coinText.text = "Point: " + point;
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
              wait(100).then(() => {
                missileHit.visible = false;
                // enemy.health -= currentMissile.damage;
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
          showAlert("Not enough point to fire!");
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
  console.log("Test cookies 2");
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

      if (point >= currentMissile.pointPerShoot) {
        point -= currentMissile.pointPerShoot;
        coinText.text = "Point: " + point;
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
            wait(100).then(() => {
              missileHit.visible = false;
              // enemy.health -= currentMissile.damage;
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
        showAlert("Not enough point to fire!\nChange your missile!");
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
  alertText.x = app.view.width / 2 - alertText.width / 2;
  alertText.y = coinText.height + 5;
  coinText.text = "Point: " + point;
  app.stage.addChild(text);
  app.stage.addChild(coinText);
  app.stage.addChild(alertText);
  //Spawn enemy
  //Set pointer
  pointer = tink.makePointer();
  //set the game state to `play`
  state = main;
  text.visible = true;
  textEffect(text, 30);
  alertText.visible = false;
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
  // coinText.text = "Point: " + point;
  if (point === 0) {
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
      let m = Object.create(missile);
      m.mId = i + 1;
      if (i !== 0) {
        m.kind = "bam" + i;
        m.damage = i + 1;
        m.isLocked = true;
        m.pointNeededToUnlock = i * 500;
        m.pointPerShoot = i * 20;
      } else {
        // m.damage = 10;
        currentMissile = m;
      }
      m.renderMissile(group, m);
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
      wait(250).then(() => countTime = time);
    } else {
      //delta is time value from last frame to this frame
      countTime -= delta;
      text.visible = true;
    }
  });
}
//Show alert
function showAlert(mess) {
  alertText.text = mess;
  alertText.x = app.view.width / 2 - alertText.width / 2;
  alertText.y = coinText.height + 5;
  alertText.visible = true;
  wait(2000).then(() => {
    alertText.visible = false;
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
  let i = getRandomInteger(1, 100);
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

  point += enemy.score * multipler;
  coinText.text = "Point: " + point;
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
  wait(500).then(() => {text.visible = false;});
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Helper func
function distanceBetweenPositions(p1, p2) {
  return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function frame(source, x, y, width, height) {
  let texture, imageFrame;
  //If the source is a string, it's either a texture in the
  //cache or an image file
  if (typeof source === "string") {
    if (TextureCache[source]) {
      texture = new Texture(TextureCache[source]);
    }
  } //If the `source` is a texture, use it
  else if (source instanceof Texture) {
    texture = new Texture(source);
  }
  if(!texture) {
    console.log(`Please load the ${source} texture into the cache.`);
  } else {
  //Make a rectangle the size of the sub-image
    imageFrame = new Rectangle(x, y, width, height);
    texture.frame = imageFrame;
    return texture;
  }
}

function wait(duration = 0) {
  return new Promise((resolve, reject) => {
  setTimeout(resolve, duration);
  });
}

function linkFont(source) {
   //Use the font's filename as the `fontFamily` name. This code captures
   //the font file's name without the extension or file path
   let fontFamily = source.split("/").pop().split(".")[0];
   //Append an `@afont-face` style rule to the head of the HTML document
   let newStyle = document.createElement("style");
   let fontFace
   = "@font-face {font-family: '" + fontFamily
   + "'; src: url('" + source + "');}";
   newStyle.appendChild(document.createTextNode(fontFace));
   document.head.appendChild(newStyle);
}

function contain(sprite, container) {
  //Create a `Set` called `collision` to keep track of the
  //boundaries with which the sprite is colliding
  var collision = new Set();
  //Left
  //If the sprite's x position is less than the container's x position,
  //move it back inside the container and add "left" to the collision Set
  if (sprite.x < container.x) {
    sprite.x = container.x;
    collision.add("left");
  }
  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    collision.add("top");
  }
  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width;
    collision.add("right");
    }
  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height;
    collision.add("bottom");
  }
  //If there were no collisions, set `collision` to `undefined`
  if (collision.size === 0) collision = undefined;
  //Return the `collision` value
  return collision;
}

function scaleToWindow(canvas, backgroundColor) {
  var scaleX, scaleY, scale, center;

  //1. Scale the canvas to the correct size
  //Figure out the scale amount on each axis
  scaleX = window.innerWidth / canvas.offsetWidth;
  scaleY = window.innerHeight / canvas.offsetHeight;

  //Scale the canvas based on whichever value is less: `scaleX` or `scaleY`
  scale = Math.min(scaleX, scaleY);
  canvas.style.transformOrigin = "0 0";
  canvas.style.transform = "scale(" + scale + ")";

  //2. Center the canvas.
  //Decide whether to center the canvas vertically or horizontally.
  //Wide canvases should be centered vertically, and
  //square or tall canvases should be centered horizontally
  if (canvas.offsetWidth > canvas.offsetHeight) {
    if (canvas.offsetWidth * scale < window.innerWidth) {
      center = "horizontally";
    } else {
      center = "vertically";
    }
  } else {
    if (canvas.offsetHeight * scale < window.innerHeight) {
      center = "vertically";
    } else {
      center = "horizontally";
    }
  }

  //Center horizontally (for square or tall canvases)
  var margin;
  if (center === "horizontally") {
    margin = (window.innerWidth - canvas.offsetWidth * scale) / 2;
    canvas.style.marginTop = 0 + "px";
    canvas.style.marginBottom = 0 + "px";
    canvas.style.marginLeft = margin + "px";
    canvas.style.marginRight = margin + "px";
  }

  //Center vertically (for wide canvases)
  if (center === "vertically") {
    margin = (window.innerHeight - canvas.offsetHeight * scale) / 2;
    canvas.style.marginTop = margin + "px";
    canvas.style.marginBottom = margin + "px";
    canvas.style.marginLeft = 0 + "px";
    canvas.style.marginRight = 0 + "px";
  }

  //3. Remove any padding from the canvas  and body and set the canvas
  //display style to "block"
  canvas.style.paddingLeft = 0 + "px";
  canvas.style.paddingRight = 0 + "px";
  canvas.style.paddingTop = 0 + "px";
  canvas.style.paddingBottom = 0 + "px";
  canvas.style.display = "block";

  //4. Set the color of the HTML body background
  document.body.style.backgroundColor = backgroundColor;

  //Fix some quirkiness in scaling for Safari
  var ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf("safari") != -1) {
    if (ua.indexOf("chrome") > -1) {
      // Chrome
    } else {
      // Safari
      //canvas.style.maxHeight = "100%";
      //canvas.style.minHeight = "100%";
    }
  }

  //5. Return the `scale` value. This is important, because you'll nee this value
  //for correct hit testing between the pointer and sprites
  return scale;
}
