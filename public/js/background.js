class Background extends TilingSprite {
  constructor(texture, width, height) {
    super(texture, width, height);
  }

  render() {
    this.x = 0;
    this.y = 0;
    this.interactive = true;
    this.onTapBackground(this);
  }

  update() {
    this.tilePosition.y += speed * DELTA_TIME;
    this.tilePosition.y %= this.texture.orig.height;
  }

  onTapBackground(bgSprite) {
    bgSprite.on("pointertap", function(event){
      if (app.isClickedEnemy) return;
      // event.stopPropagation();
      if (missileFly.isMissileFlying) return;
      //handle double click
      if (app.isDoubleTap()) {
        let clickPosX = event.data.global.x;
        let clickPosY = event.data.global.y;

        bgSprite.interactive = false;
        missileFly.shootMissile((checkOutOfPoint) => {
          if (checkOutOfPoint) {
            //Update text pos
            uiManager.showText("Missed!!", () => {
              bgSprite.interactive = true;
            });
          } else {
            bgSprite.interactive = true;
          }
        }, clickPosX, clickPosY);
      }
    });
  }
}
