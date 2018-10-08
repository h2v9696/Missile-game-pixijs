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

//Enemy death handler
function enemyDeath(enemy/*, perfectCircle, greatCircle, goodCircle*/) {
    //Set death animation
    let explosionAnimation = new AnimatedSprite(explosionTextures);
    explosionAnimation.animationSpeed = 0.15;
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