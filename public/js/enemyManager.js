class EnemyManager extends Container {

  constructor() {
    super();
    this.enemyTextures = null;
    this.scaleTimes = 1;
    // this.enemyMaxHealth = 5;
    this.spawnHandler = null;
    this.timeWaitSpawnEnemy = 120;
    this.pointLost = 50;
  }

  loadTextures() {
    this.enemyTextures = [
      Loader.resources["public/img/enemy1.png"].texture,
      Loader.resources["public/img/enemy2.png"].texture,
      Loader.resources["public/img/enemy3.png"].texture,
      Loader.resources["public/img/enemy4.png"].texture
    ];
  }

  update() {
    this.children.some(enemy => {
      enemy.y += speed * DELTA_TIME; //Add equal to background so it's move along with bg
      //If enemy pass over screen, decrease player point by 50
      if(enemy.y > app.view.height - 120 && !enemy.isPassOver){
        eventDispatcher.postEvent('ChangeCoinText', "Point: " + (app.point - enemyManager.pointLost * app.currentMissile.pointEarnMultiple));

        uiManager.showText("Enemy escape!!\nPoint -"
         + enemyManager.pointLost * app.currentMissile.pointEarnMultiple,
          function() {
            eventDispatcher.postEvent('ChangePoint', -enemyManager.pointLost  * app.currentMissile.pointEarnMultiple);
          }, false, 500);
        enemy.isPassOver = true;
      }

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
