class EnemyManager {
  constructor() {
    this.enemyTextures = null;
    this.scaleTimes = 1;

  }

  loadTextures() {
    this.enemyTextures = [
      Loader.resources["public/imgs/enemy1.png"].texture,
      Loader.resources["public/imgs/enemy2.png"].texture,
      Loader.resources["public/imgs/enemy3.png"].texture,
      Loader.resources["public/imgs/enemy4.png"].texture
    ];
  }
}
