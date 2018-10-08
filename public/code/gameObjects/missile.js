let missile = {
    mId: 0,
    damage: 1,
    kind: "bam",
    isLocked: false,
    pointNeededToUnlock: 0,
    pointPerShoot: 1,
    missileText: null,
    renderMissile: function(parent, missile) {
      let mContainer = new Container();
      let m = new Sprite(
        frame("public/imgs/tankes.png", 128, 64, 32, 32)
      );
      let locker = new Sprite(
        frame("public/imgs/tankes.png", 224, 64, 32, 32)
      );
      let pointPerShootText = new Text(missile.pointPerShoot + "P", {fontSize: 30, align: "center"});
      // let damageText = new Text(missile.damage + "D", {fontSize: 20, align: "center"});
  
      missile.missileText = new Text("" + missile.pointNeededToUnlock + "P", {fontSize: 30, fill: "white"});
      pointPerShootText.visible = false;
      // damageText.visible = false;
      m.alpha = 0.5;
      if (!missile.isLocked) {
        locker.visible = false;
        m.alpha = 1;
      }
      if (currentMissile.mId === missile.mId) {
        missile.missileText.visible = true;
        pointPerShootText.visible = true;
        // damageText.visible = true;
        missile.missileText.text = "Selected";
      }
      m.interactive = true;
      m.height = scroll_group.height - missile.missileText.height;
      m.width = 150;
      missile.missileText.x = m.x + m.width / 2 - missile.missileText.width / 2;
      missile.missileText.y = scroll_group.height - missile.missileText.height;
      locker.scale.x = 2;
      locker.scale.y = 2;
      locker.x = m.x + m.width / 2 - locker.width / 2;
      locker.y = m.y + m.height / 2 - locker.height / 2;
  
  
      pointPerShootText.x = m.x;
      // damageText.x = m.width - damageText.width;
      // damageText.y = pointPerShootText.y + pointPerShootText.height;
  
      m.on("pointertap", function(e){
        if (currentMissile.damage === missile.damage) return;
        if (missile.isLocked) {
          if (missile.pointNeededToUnlock < point) {
            point -= missile.pointNeededToUnlock;
            coinText.text = "Point: " + point;
            missile.isLocked = false;
            locker.visible = false;
            m.alpha = 1;
            pointPerShootText.visible = true;
            // damageText.visible = true;
            missile.missileText.visible = false;
          } else {
            showAlert("Not enough point to unlock!");
          }
        } else {
          currentMissile.missileText.visible = false;
          currentMissile = missile;
          currentMissile.missileText.text = "Selected";
          missile.missileText.x = m.x + m.width / 2 - missile.missileText.width / 2;
          currentMissile.missileText.visible = true;
        }
      });
      mContainer.addChild(m);
      mContainer.addChild(locker);
      mContainer.addChild(pointPerShootText);
      // mContainer.addChild(damageText);
      mContainer.addChild(missile.missileText);
  
      parent.addChild(mContainer);
    }
  };