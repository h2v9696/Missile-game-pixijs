class MainScene extends PIXI.Application {
  constructor(width, height, bgColor) {
    super(width, height, {backgroundColor : bgColor}, {legacy : true});
    this.currentMissile = new Missile();
    this.point = 1000;
    this.alertText = new Text("Not enough point to unlock!", {
      fontSize: 30,
      fill: "red",
      align: "center",
      stroke: "white",
      strokeThickness: 4});
  }

  showAlert(mess) {
    this.alertText.text = mess;
    this.alertText.x = app.view.width / 2 - this.alertText.width / 2;
    this.alertText.y = coinText.height + 5;
    this.alertText.visible = true;
    Helper.wait(2000).then(() => {
      this.alertText.visible = false;
    });
  }
}
