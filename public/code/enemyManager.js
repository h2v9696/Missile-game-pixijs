class EnemyManager extends Container {

  constructor() {
    super();
    this.enemyTextures = null;
    this.scaleTimes = 1;
    // this.enemyMaxHealth = 5;
    this.spawnHandler = null;
    this.timeWaitSpawnEnemy = 120;
  }

  loadTextures() {
    this.enemyTextures = [
      Loader.resources["public/imgs/enemy1.png"].texture,
      Loader.resources["public/imgs/enemy2.png"].texture,
      Loader.resources["public/imgs/enemy3.png"].texture,
      Loader.resources["public/imgs/enemy4.png"].texture
    ];
  }

  update() {
    this.children.some(enemy => {
      enemy.y += addPosision * DELTA_TIME; //Add equal to background so it's move along with bg
      //Destroy enemy when out of screen about 300px
      if (enemy.y > app.view.height + 300) {
        this.removeChild(enemy);
      }
    });
  }

  //Execute a function in a short of time and loop with update
  spawnEnemies() {
    let timeWaitSpawnEnemy = 120;
    let countTime = timeWaitSpawnEnemy;
    app.ticker.add(this.spawnHandler = function(delta) {
      //Countdown time to spawn
      if (countTime < 0) {
        let enemy = new Enemy();
        enemy.render(enemyManager);
        countTime = timeWaitSpawnEnemy;
      } else {
        //delta is timeWaitSpawnEnemy value from last frame to this frame
        countTime -= delta;
      }
    });
  }
}
