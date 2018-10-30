class MainScene extends PIXI.Application {
  constructor(width, height, bgColor) {
    super(width, height, {backgroundColor : bgColor}, {legacy : true},
      {autoResize: true}, {resolution: devicePixelRatio});
    this.currentMissile = new Missile();
    this.point = 1000;
    this.isClickedEnemy = false;
    this.timer = 0;
    this.isClicked = false;
    this.state = null;
    this.countTap = 0;
    this.replay = false;
    this.currentLevel = 1;
    this.highScore = this.point;

    let changePoint = function(amount) {
      app.point += amount;
      if (app.point < 0) app.point = 0;
      if (app.point > app.highScore) app.highScore = app.point;
      eventDispatcher.postEvent('ChangeCoinText', "Point: " + app.point);
      if (Math.floor(app.point / 1000) > app.currentLevel) {
        uiManager.showText("Speed up!!")
        speed *= 1.5;
        app.currentLevel++;
      }
      // } else if (Math.floor(app.point / 1000) < app.currentLevel) {
      //   if (speed > 2) {
      //     uiManager.showText("Speed down~")
      //     speed /= 1.5;
      //   }
      //   else speed = 2;
      //   app.currentLevel =  app.currentLevel <= 1 ? 1 : app.currentLevel-1;
      // }
    }

    eventDispatcher.registerListeners('ChangePoint', changePoint);
  }

  isDoubleTap() {
    if (app.ticker.speed === 0) return;
    let timeWaitTap = 15;
    if (!this.isClicked) {
      this.isClicked = true;
      this.ticker.add(this.tapHandler = function(delta) {
        app.timer += DELTA_TIME;
        if (app.timer >= timeWaitTap) {
          app.resetTickerFucntion();
        }
      });
    }
    this.countTap++;
    return (this.countTap === 2 && this.timer < timeWaitTap)
  }

  resetTickerFucntion() {
    this.isClicked = false;
    this.isClickedEnemy = false;
    this.timer = 0;
    this.ticker.remove(this.tapHandler);
    this.countTap = 0;
    app.ticker.speed = 1;
    // app.ticker.remove(missileFlyHandler);
  }
}
