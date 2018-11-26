class Missile {
  constructor(id = 1, dmg = 1, kind = "", isLocked = false, pointToUnlock = 0, pointPerShoot = 1) {
    this.mId = id;
    this.damage = dmg;
    this.kind = kind;
    this.isLocked = isLocked;
    this.pointNeededToUnlock = pointToUnlock;
    this.pointPerShoot = pointPerShoot;
    this.missileText = new Text("" + this.pointNeededToUnlock + "P", {fontSize: 30, fill: "white"});
    this.locker = null;
    this.pointPerShootText = null;
    this.pointEarnMultiple = this.mId > 1 ? Math.floor(this.pointPerShoot / 10) : 1;
  }

  render(parent) {
    let mContainer = new Container();
    let m = new Sprite(
      Helper.frame("public/img/tankes.png", 128, 64, 32, 32)
    );
    this.locker = new Sprite(Helper.frame("public/img/tankes.png", 224, 64, 32, 32));
    this.pointPerShootText = new Text(this.pointPerShoot + "P", {fontSize: 30, align: "center"});
    // let damageText = new Text(missile.damage + "D", {fontSize: 20, align: "center"});
    this.pointPerShootText.visible = false;
    // damageText.visible = false;
    m.alpha = 0.5;
    if (!this.isLocked) {
      this.locker.visible = false;
      m.alpha = 1;
    }
    if (app.currentMissile.mId === this.mId) {
      this.missileText.visible = true;
      this.pointPerShootText.visible = true;
      // damageText.visible = true;
      this.missileText.text = "Selected";
    }
    m.interactive = true;
    m.height = uiManager.scroll_group.height - this.missileText.height;
    m.width = 150;
    switch (this.mId) {
      case 1:
        break;
      case 2:
        m.tint = 0x0056e2;
        break;
      case 3:
        m.tint = 0x06aa03;
        break;
      case 4:
        m.tint = 0xff0000;
        break;
      default:
        break;
    }
    this.missileText.x = m.x + m.width / 2 - this.missileText.width / 2;
    this.missileText.y = uiManager.scroll_group.height - this.missileText.height;
    this.locker.scale.x = 2;
    this.locker.scale.y = 2;
    this.locker.x = m.x + m.width / 2 - this.locker.width / 2;
    this.locker.y = m.y + m.height / 2 - this.locker.height / 2;

    this.pointPerShootText.x = m.x;
    // damageText.x = m.width - damageText.width;
    // damageText.y = this.pointPerShootText.y + this.pointPerShootText.height;
    this.onTapMissile(m, this);

    mContainer.addChild(m);
    mContainer.addChild(this.locker);
    mContainer.addChild(this.pointPerShootText);
    mContainer.addChild(this.missileText);
    // mContainer.addChild(damageText);

    parent.addChild(mContainer);
  }

  onTapMissile(sprite, missile) {
    sprite.on("pointertap", function(event){
      var horizontalMoved = Math.abs(event.data.global.x - uiManager.scroll_group._startTouch.x);
      if (horizontalMoved > 100) return;
      // if (app.currentMissile.damage === this.damage) return;
      if (missile.isLocked) {
        if (missile.pointNeededToUnlock < app.point) {
          eventDispatcher.postEvent('ChangePoint', -missile.pointNeededToUnlock);

          missile.isLocked = false;
          missile.locker.visible = false;
          sprite.alpha = 1;
          missile.pointPerShootText.visible = true;
          // damageText.visible = true;
          missile.missileText.visible = false;
        } else {
          uiManager.showAlert("Not enough point to unlock!");
        }
      } else {
        missileFly.changeMissileTexture(missile.mId);
        app.currentMissile.missileText.visible = false;
        app.currentMissile = missile;
        app.currentMissile.missileText.text = "Selected";
        missile.missileText.x = sprite.x + sprite.width / 2 - missile.missileText.width / 2;
        app.currentMissile.missileText.visible = true;
      }
    });
  }
}
