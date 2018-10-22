class LoginScreen extends Container {
  constructor() {
    super();
    this.bg = null;
  }

  render() {
    this.bg = new Sprite(Loader.resources["public/img/blackbg.jpg"].texture);
    this.bg.alpha = 0.5
    this.bg.y = 0;
    this.bg.x = 0;
    this.bg.width = app.view.width;
    this.bg.height = app.view.height;
    this.bg.visible = true;
    this.bg.interactive = true;
    this.addChild(this.bg);
  }

  addButton() {

  }
}
