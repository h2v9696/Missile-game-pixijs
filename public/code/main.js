class MainScene extends PIXI.Application {
  constructor(width, height, bgColor) {
    super(width, height, {backgroundColor : bgColor}, {legacy : true});
    this.currentMissile = new Missile();
    this.point = 1000;
    this.isClickedEnemy = false;
    this.alertText = new Text("Not enough point to unlock!", {
      fontSize: 30,
      fill: "red",
      align: "center",
      stroke: "white",
      strokeThickness: 4});
    this.timer = 0;
    this.isClicked = false;
    this.state = null;
    this.mainText = new Text("Tap to start!", {
      fontSize: 80, align: "center",
      wordWrap: true, wordWrapWidth: this.view.width,
      stroke: "white", strokeThickness: 4
    });
    this.countTap = 0;
  }

  showText(onComplete = null) {
    this.mainText.x = this.view.width / 2 - this.mainText.width / 2;
    this.mainText.y = this.view.height / 2 - this.mainText.height / 2;
    this.mainText.visible = true;
    Helper.wait(500).then(() => {
      this.mainText.visible = false;
      if (onComplete !== null)
        onComplete()
    });
  }

  showAlert(mess) {
    this.alertText.text = mess;
    this.alertText.x = app.view.width / 2 - this.alertText.width / 2;
    this.alertText.y = coinText.height + 5;
    this.alertText.visible = true;
    Helper.wait(2000).then(() => {
      this.alertText.visible = false;
    });
    this.mainText = new Text("Tap to start!", {
      fontSize: 80, align: "center",
      wordWrap: true, wordWrapWidth: app.view.width,
      stroke: "white", strokeThickness: 4
    });
  }

  isDoubleTap() {
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
