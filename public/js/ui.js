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
    this.pauseBtn = null;
    this.loginAsGuestBtn = null;
    this.loginAsUserBtn = null;
    this.theme = null;
  }

  render() {
    this.setupTexts();
    this.setupScrollBG();
    //Load theme gown
    this.theme = new GOWN.ThemeParser("public/js/libs/gown/docs/themes/assets/metalworks_desktop/metalworks_desktop.json");
    this.theme.once(GOWN.Theme.COMPLETE, this.settingUIs, this);
    GOWN.loader.load();
  }

  settingUIs() {
    this.settingScroll();
    this.setupButtons();
  }

  setupTexts() {
    this.mainText.x = app.view.width / 2 - this.mainText.width / 2;
    this.mainText.y = app.view.height / 2 - this.mainText.height / 2;
    this.coinText.x = 5;
    this.coinText.y = 0;
    this.alertText.x = app.view.width / 2 - this.alertText.width / 2;
    this.alertText.y = this.coinText.height + 5;
    this.coinText.text = "Point: " + app.point;
    this.coinText.visible = false;
    this.addChild(this.mainText);
    this.addChild(this.coinText);
    this.addChild(this.alertText);
    this.mainText.visible = true;
    this.alertText.visible = false;
  }

  setupScrollBG() {
    //Setup scroll BG
    this.rectangle.beginFill(0xff6e00);
    this.rectangle.lineStyle(2, 0x000000, 2);
    this.rectangle.drawRect(0, 0, this.scrollWidth - 4, this.scrollHeight + 10);
    this.rectangle.x = 2;
    this.rectangle.y = app.view.height - this.scrollHeight - 10;
    this.rectangle.interactive = true;
    this.rectangle.endFill();
    this.rectangle.visible = false;
    this.addChild(this.rectangle);

  }

  setupButtons() {
    //Pause Btn
    this.pauseBtn = new GOWN.Button(this.theme);
    this.pauseBtn.width = 100;
    this.pauseBtn.height = 50;
    this.pauseBtn.x = app.view.width - this.pauseBtn.width - 5;
    this.pauseBtn.y = 5;
    this.pauseBtn.label = "PAUSE";
    this.pauseBtn.visible = false;

    this.pauseBtn.on(GOWN.Button.TRIGGERED, function () {
      if (app.state !== pause) {
        uiManager.pauseBtn.label = "RESUME";
        app.state = pause;
      }
      else {
        app.state = play;
        uiManager.settingPrePlay();
        uiManager.pauseBtn.label = "PAUSE";
      }
    });
    this.addChild(this.pauseBtn);
    // Login btn
    //Pause Btn
    this.loginAsGuestBtn = new GOWN.Button(this.theme);
    this.loginAsGuestBtn.width = 250;
    this.loginAsGuestBtn.height = 100;
    this.loginAsGuestBtn.x = 10;
    this.loginAsGuestBtn.y = app.view.height / 2 - this.mainText.height / 2 - 100;
    this.loginAsGuestBtn.label = "Play as Guest";
    this.loginAsGuestBtn.visible = true;

    this.loginAsGuestBtn.on(GOWN.Button.TRIGGERED, function () {
      app.state = main;
      app.ticker.speed = 1;
      uiManager.textEffect(uiManager.mainText, 30);
      loginScreen.visible = false;
    });
    loginScreen.addChild(this.loginAsGuestBtn);
  }

  waitTapScreen() {
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
    this.scroll_group = new GOWN.ScrollContainer(this.theme);
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
    this.pauseBtn.visible = true;
    this.pointer.tap = null;
    app.ticker.remove(this.textHandler);
    app.ticker.speed = 1;
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
