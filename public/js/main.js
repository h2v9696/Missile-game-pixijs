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

    let changePoint = function(amount) {
      app.point += amount;
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
