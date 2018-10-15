class Enemy {
  constructor(id = 0, kind = "", perfect = 70, great = 50, good = 10) {
    this.eId = id;
    this.kind = kind;
    // this.health: 5,
    this.perfectPos = {
        x: 0,
        y: 0,
        radius: 10
      }
    this.greatPos = {
        x: 0,
        y: 0,
        radius: 40
      }
    this.goodPos = {
        x: 0,
        y: 0,
        radius: 50
      }
    this.pointPerfectHit = 70;
    this.pointGreatHit = 50;
    this.pointGoodHit = 10;
    this.sprite = null;
    this.score = 10;
  }

  render(parent) {
    if (enemyManager === null) {
      console.error("No enemy manager founded!");
      return;
    }

    let e = new Sprite(enemyManager.enemyTextures[Helper.getRandomInteger(0, 4)]);
    this.sprite = e;

    this.perfectPos.x = Helper.getRandomInteger(e.width - 3 * e.width / 4, e.width - e.width / 4);
    this.perfectPos.y = Helper.getRandomInteger(e.height - 3 * e.height / 4, e.height - e.height / 4);
    this.greatPos.x = this.perfectPos.x - 10;
    this.greatPos.y = this.perfectPos.y - 10;
    this.goodPos.x = e.width / 2;
    this.goodPos.y = e.height / 2;
    this.goodPos.radius = e.width / 2;
    //Set random position in horizon
    e.x = Helper.getRandomInteger(0, app.view.width - e.width);
    e.y = - e.height * enemyManager.scaleTimes;
    //Draw circle
    // visualizeCircle(e, this, parent);
    //Set scale enemy (will hange later)
    e.scale.x = enemyManager.scaleTimes;
    e.scale.y = enemyManager.scaleTimes;
    //Enemy Heath
    // this.health = enemyMaxHealth;
    // this.healthText = new Text("Health: " + this.health, {fontSize: 20, fill: "red", align: "center"});
    // this.healthText.x = this.x - this.healthText.width / 2 + enemy.width / 2;
    // this.healthText.y = this.y - this.healthText.height;
    this.score = this.pointGoodHit;

    e.interactive = true;
    e.hitArea = TransparencyHitArea.create(e);
    // e.on("tap", function(e){ // Mobile test
    this.onTapEnemy(parent, e, this);
    parent.addChild(e);
  }

  onTapEnemy(parent, sprite, enemy) {
    let isClicked = false;
    let resultText = '';

    sprite.on("pointertap", function(event){
      if (missileFly.isMissileFlying) return;
      app.isClickedEnemy = true;
      //handle double click enemy
      if (app.isDoubleTap()) {
        let localClickPos = event.data.getLocalPosition(sprite);
        let clickPosX = event.data.global.x;
        let clickPosY = event.data.global.y;

        sprite.interactive = false;

        if (Helper.distanceBetweenPositions(enemy.perfectPos, localClickPos) < enemy.perfectPos.radius) {
          resultText = "Perfect!!! ";
          enemy.score = enemy.pointPerfectHit;
        } else if (Helper.distanceBetweenPositions(enemy.greatPos, localClickPos) < enemy.greatPos.radius) {
          resultText = "Great!! ";
          enemy.score = enemy.pointGreatHit;
        } else if (Helper.distanceBetweenPositions(enemy.goodPos, localClickPos) < enemy.goodPos.radius) {
          resultText = "Good! ";
          enemy.score = enemy.pointGoodHit;
        }

        missileFly.shootMissile(() => {
          app.mainText.text = resultText;
          enemy.enemyDeath(parent, enemy);
          app.isClickedEnemy = false;
          enemy.sprite.removeAllListeners();
          parent.removeChild(enemy.sprite);
        }, clickPosX, clickPosY);
      }
    });
  }

  onMissileHitEnemy(enemy) {
    // enemy.health -= app.currentMissile.damage;
    //Enemy death
    // if (enemy.health <= 0 ) {
    //   enemyDeath(enemy);
    // }
    // enemyDeath(enemy, perfectCircle, greatCircle, goodCircle);
    this.enemyDeath(enemy);
    app.isClickedEnemy = false;
    // e.healthText.text = "Health: " + enemy.health;
    // e.interactive = true;
  }

  //Enemy death handler
  enemyDeath(parent, enemy/*, perfectCircle, greatCircle, goodCircle*/) {
    //Set death animation
    let explosionAnimation = new AnimatedSprite(missileFly.explosionTextures);
    explosionAnimation.animationSpeed = 0.15
    // explosionAnimation.width = 128;
    // explosionAnimation.height = 128;
    explosionAnimation.loop = false;
    explosionAnimation.visible = false;
    explosionAnimation.pivot.x = 0.5;
    explosionAnimation.pivot.y = 0.5;
    explosionAnimation.scale.x = 0.7;
    explosionAnimation.scale.y = 0.7;


    let multipler = 1;
    let i = Helper.getRandomInteger(1, 100);
    app.mainText.text += "+" + enemy.score;
    if (i < 2)
    {
      multipler = 10;
    } else if (i < 5)
    {
      multipler = 2;
    }
    if (multipler > 1)
      app.mainText.text += "\nScore x " + multipler + "!!";
    app.showText();

    app.point += enemy.score * multipler;
    eventDispatcher.postEvent('ChangeCoinText', "Point: " + app.point);
    // enemies.removeChild(perfectCircle);
    // enemies.removeChild(greatCircle);
    // enemies.removeChild(goodCircle);

    explosionAnimation.position.set(enemy.sprite.x, enemy.sprite.y);
    parent.addChild(explosionAnimation);
    explosionAnimation.visible = true;
    explosionAnimation.play();
    // enemy.health = 0;
    // enemy.healthText.visible = false;
  }

  visualizeCircle(sprite, enemy, parent) {
    let perfectCircle = new Graphics();
    perfectCircle.beginFill(0xff0000);
    perfectCircle.drawCircle(sprite.getGlobalPosition().x + enemy.perfectPos.x,
      sprite.getGlobalPosition().y + enemy.perfectPos.y, enemy.perfectPos.radius);
    perfectCircle.alpha = 0.3;
    perfectCircle.endFill();

    let greatCircle = new Graphics();
    greatCircle.beginFill(0xa2ff00);
    greatCircle.drawCircle(sprite.getGlobalPosition().x + enemy.greatPos.x,
      sprite.getGlobalPosition().y + enemy.greatPos.y, enemy.greatPos.radius);
    greatCircle.alpha = 0.3;
    greatCircle.endFill();

    let goodCircle = new Graphics();
    goodCircle.beginFill(0x00c6ff);
    goodCircle.drawCircle(sprite.getGlobalPosition().x + enemy.goodPos.x,
      sprite.getGlobalPosition().y + enemy.goodPos.y, enemy.goodPos.radius);
    goodCircle.alpha = 0.3;
    goodCircle.endFill();

    parent.addChild(goodCircle);
    parent.addChild(greatCircle);
    parent.addChild(perfectCircle);
  }
}
