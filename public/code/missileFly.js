class MissileFlyEffect {
  constructor() {
    this.explosionTextures = null;
    this.missileSprite = null;
    this.missileHit = false;
    this.isMissileFlying = false;
  }

  render(parent) {
    //Create fly missile
    this.missileSprite = new Sprite(Loader.resources["public/imgs/missile.png"].texture);
    this.missileSprite.y = app.view.height - 100;
    this.missileSprite.x = 0;
    this.missileSprite.width = 23.6;
    this.missileSprite.height = 192;
    this.missileSprite.visible = false;
    this.missileHit = new Sprite(Loader.resources["public/imgs/explosion1.png"].texture);
    this.missileHit.width = 128;
    this.missileHit.height = 128;
    this.missileHit.visible = false;
    parent.addChild(this.missileSprite);
    parent.addChild(this.missileHit);
  }

  loadExplosionTextures() {
    this.explosionTextures = [
      Loader.resources["public/imgs/explosion1.png"].texture,
      Loader.resources["public/imgs/explosion2.png"].texture,
      Loader.resources["public/imgs/explosion3.png"].texture,
    ];
  }

  shootMissile(callback, posX, posY) {
    let checkOutOfPoint = (app.point >= app.currentMissile.pointPerShoot);
    if (checkOutOfPoint) {
      eventDispatcher.postEvent('ChangePoint', -app.currentMissile.pointPerShoot);
      eventDispatcher.postEvent('ChangeCoinText', "Point: " + app.point);
      //Stop scroll
      app.state = pause;
      this.missileSprite.visible = true;
      this.isMissileFlying = true;
      //Random fire spot
      // let fireSpotX = getRandomInteger(e.x + missileSprite.width / 2, e.x + e.width - missileSprite.width / 2);
      this.missileSprite.x = posX;
      app.ticker.add(this.missileFlyHandler = function(delta) {
        // let fireSpotY = getRandomInteger(e.y + 10, e.y + e.height - 10);
        if (missileFly.missileSprite.y > posY)
          missileFly.missileSprite.y -= addPosision * 8 * DELTA_TIME;
        else {
          app.ticker.remove(missileFly.missileFlyHandler);
          missileFly.missileHit.x = missileFly.missileSprite.x - missileFly.missileHit.width / 2;
          missileFly.missileHit.y = missileFly.missileSprite.y - missileFly.missileHit.height / 2;
          missileFly.missileSprite.visible = false;
          missileFly.missileSprite.y = app.view.height - 100;
          // this.missileHit.x = e.x - e.width / 2;
          // this.missileHit.y = e.y - e.eheight / 2;

          missileFly.missileHit.visible = true;
          Helper.wait(100).then(() => {
            missileFly.missileHit.visible = false;
            missileFly.isMissileFlying = false;
            callback(checkOutOfPoint);
            app.resetTickerFucntion();
            app.state = play;
          });
        }
      });
    } else {
      uiManager.showAlert("Not enough point to fire!");
      callback(checkOutOfPoint);
    }
  }
}
