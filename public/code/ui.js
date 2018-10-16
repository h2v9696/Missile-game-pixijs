class UIManager extends Container {
  constructor() {
    super();
    this.mainText = new Text("Tap to start!", {
      fontSize: 80, align: "center",
      wordWrap: true, wordWrapWidth: app.view.width,
      stroke: "white", strokeThickness: 4
    });
    this.alertText = new Text("Not enough point to unlock!", {
      fontSize: 30,
      fill: "red",
      align: "center",
      stroke: "white",
      strokeThickness: 4});
    this.textHandler = null;
    this.scroll_group = null;
    this.rectangle = new Graphics();
    this.pointer = tink.makePointer();
    this.sLoading = true;

    this.coinText = new Text("", {fontSize: 40, stroke: "white", strokeThickness: 4});
    let changeCoinText = function(mess) {
      uiManager.coinText.text = mess;
    }
    eventDispatcher.registerListeners('ChangeCoinText', changeCoinText);
    this.scrollWidth = app.view.width;
    this.scrollHeight = 150;
    this.hitEnemyResultText = '';
  }

  render() {
    this.mainText.x = app.view.width / 2 - this.mainText.width / 2;
    this.mainText.y = app.view.height / 2 - this.mainText.height / 2;
    this.coinText.x = 5;
    this.coinText.y = 0;
    this.alertText.x = app.view.width / 2 - this.alertText.width / 2;
    this.alertText.y = this.coinText.height + 5;
    this.coinText.text = "Point: " + app.point;
    this.addChild(this.mainText);
    this.addChild(this.coinText);
    this.addChild(this.alertText);
    this.mainText.visible = true;
    this.textEffect(this.mainText, 30);
    this.alertText.visible = false;
    //Setup scroll BG
    this.rectangle.beginFill(0x000000);
    this.rectangle.lineStyle(4, 0x000000, 1);
    this.rectangle.drawRect(0, 0, this.scrollWidth - 4, this.scrollHeight + 10);
    this.rectangle.x = 2;
    this.rectangle.y = app.view.height - this.scrollHeight - 10;
    this.rectangle.interactive = true;
    this.rectangle.endFill();
    this.rectangle.visible = false;
    this.addChild(this.rectangle);
    //Load theme gown
    var theme = new GOWN.ThemeParser("public/libs/gown/docs/themes/assets/aeon_desktop/aeon_desktop.json");
    theme.once(GOWN.Theme.COMPLETE, this.settingScroll, this);
    GOWN.loader.load();
    // pauseBtn = new GOWN.Button(theme);
    //   pauseBtn.width = 150;
    //   pauseBtn.height = 100;
    //   pauseBtn.x = 20;
    //   pauseBtn.y = 30;
    //   pauseBtn.label = "PAUSE";

    //   pauseBtn.on(GOWN.Button.TRIGGERED, function () {
    //     if (app.app.app.state !== pause) {
    //       pauseBtn.label = "RESUME";
    //       app.app.state = pause;
    //     }
    //     else {
    //       prePlay();
    //       app.state = play;
    //       pauseBtn.label = "PAUSE";
    //     }
    //   });
    // app.stage.addChild(pauseBtn);
  }

  waitTapScreen() {
    this.coinText.visible = false;
    if (!this.isLoading) {
      this.mainText.text = "Tap to start!\n" + user.username;
      this.pointer.tap = () => {
          this.settingPrePlay();
          enemyManager.spawnEnemies();
          app.state = play;
      }
    } else this.mainText.text = "Loading...";
  }
  //Complete load gown theme and gen UI
  settingScroll() {
    var group = new GOWN.LayoutGroup();
    group.layout = new GOWN.layout.HorizontalLayout();
    this.scroll_group = new GOWN.ScrollContainer();
    this.scroll_group.x = 10;
    this.scroll_group.y = app.view.height - this.scrollHeight;
    this.scroll_group._useMask = false;
    this.scroll_group.height = this.scrollHeight - 10;
    this.scroll_group.width = this.scrollWidth - 20;
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
    this.scroll_group.viewPort = group;
    this.scroll_group.visible = false;
    app.stage.addChild(this.scroll_group);
    this.isLoading = false;
  }

  settingPrePlay() {
    this.rectangle.visible = true;
    this.mainText.visible = false;
    this.coinText.visible = true;
    this.scroll_group.visible = true;
    this.pointer.tap = null;
    app.ticker.remove(this.textHandler);
  }

  showText(text, onComplete = null, isGameOver = false) {
    this.mainText.text = text;
    this.mainText.x = app.view.width / 2 - this.mainText.width / 2;
    this.mainText.y = app.view.height / 2 - this.mainText.height / 2;
    this.mainText.visible = true;
    if (!isGameOver)
      Helper.wait(500).then(() => {
        this.mainText.visible = false;
        if (onComplete !== null)
          onComplete()
      });
  }
  //Start text effect
  textEffect(text, time) {
    let countTime = time;
    app.ticker.add(this.textHandler = function(delta) {
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

  showAlert(mess) {
    this.alertText.text = mess;
    this.alertText.x = app.view.width / 2 - this.alertText.width / 2;
    this.alertText.y = this.coinText.height + 5;
    this.alertText.visible = true;
    Helper.wait(2000).then(() => {
      this.alertText.visible = false;
    });
  }
}
