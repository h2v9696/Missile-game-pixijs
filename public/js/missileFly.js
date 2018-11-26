class MissileFlyEffect {
  constructor() {
    this.explosionTextures = null;
    this.missileSprite = null;
    this.missileHit = false;
    this.isMissileFlying = false;
    this.missileTextures = null;
  }

  render(parent) {
    //Create fly missile
    this.missileTextures = [
      Loader.resources["public/img/missile.png"].texture,
      Loader.resources["public/img/missile_blue.png"].texture,
      Loader.resources["public/img/missile_green.png"].texture,
      Loader.resources["public/img/missile_red.png"].texture
    ];
    if (app.currentMissile != null && app.currentMissile.mId <= 4)
      this.missileSprite = new Sprite(missileFly.missileTextures[app.currentMissile.mId - 1]);
    else
      this.missileSprite = new Sprite(missileFly.missileTextures[0]);
    this.missileSprite.y = app.view.height - 100;
    this.missileSprite.x = 0;
    this.missileSprite.width = 23.6;
    this.missileSprite.height = 192;
    this.missileSprite.visible = false;
    this.missileHit = new Sprite(Loader.resources["public/img/explosion1.png"].texture);
    this.missileHit.width = 128;
    this.missileHit.height = 128;
    this.missileHit.visible = false;
    parent.addChild(this.missileSprite);
    parent.addChild(this.missileHit);
  }

  loadTextures() {
    this.explosionTextures = [
      Loader.resources["public/img/explosion1.png"].texture,
      Loader.resources["public/img/explosion2.png"].texture,
      Loader.resources["public/img/explosion3.png"].texture,
    ];
    this.missileTextures = [
      Loader.resources["public/img/missile.png"].texture,
      Loader.resources["public/img/missile_blue.png"].texture,
      Loader.resources["public/img/missile_green.png"].texture,
      Loader.resources["public/img/missile_red.png"].texture
    ];
  }

  changeMissileTexture(missileId) {
    this.missileSprite.texture = missileFly.missileTextures[missileId - 1];
  }

  shootMissile(callback, posX, posY) {
    let checkOutOfPoint = (app.point >= app.currentMissile.pointPerShoot);
    if (checkOutOfPoint) {
      eventDispatcher.postEvent('ChangePoint', -app.currentMissile.pointPerShoot);
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
          missileFly.missileSprite.y -= 16 * DELTA_TIME;
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
