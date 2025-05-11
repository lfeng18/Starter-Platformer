class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 500;
        this.DRAG = 700;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -900;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setScale(2.0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        const spawnPoint = this.map.findObject("Objects", obj => obj.name === "playerSpawn");
    if(!spawnPoint) {
        console.error("找不到playerSpawn对象！请检查Tiled地图");
        // 回退到默认位置
        my.sprite.player = this.physics.add.sprite(game.config.width/4, game.config.height/2, "platformer_characters", "tile_0000.png").setScale(SCALE);
    } else {
        my.sprite.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "platformer_characters", "tile_0000.png").setScale(SCALE);
    }

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);


        //EC1
        this.coins = this.physics.add.group();
        const coinPoints = this.map.filterObjects("Objects", obj => obj.type === "coin");
        coinPoints.forEach(point => {
            let coin = this.coins.create(point.x, point.y, "platformer_characters", "tile_0002.png");
            coin.setScale(SCALE);
            coin.body.setAllowGravity(false); // 硬币不受重力影响
        });
        
        // 硬币碰撞
        this.physics.add.overlap(my.sprite.player, this.coins, (player, coin) => {
            coin.destroy();
        });

        //EC2
 

    //EC3
    this.cameras.main.setBounds(
        0, 
        0, 
        this.map.widthInPixels * this.groundLayer.scaleX, 
        this.map.heightInPixels * this.groundLayer.scaleY
    );
    
    this.cameras.main.startFollow(my.sprite.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(50, 50);
    this.cameras.main.setZoom(1.5); // 可选：放大一点
    
    // 调试用：显示相机边界
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.5);
    graphics.strokeRect(
        0, 
        0, 
        this.map.widthInPixels * this.groundLayer.scaleX, 
        this.map.heightInPixels * this.groundLayer.scaleY
    );

    //EC4
    this.enemies = this.physics.add.group();
    const spawnPoints = this.map.filterObjects("EnemySpawns", obj => obj.name === "enemy");
    
    // 随机选择几个生成点
    const selectedSpawns = Phaser.Utils.Array.Shuffle(spawnPoints).slice(0, 3);
    
    selectedSpawns.forEach(point => {
        let enemy = this.enemies.create(point.x, point.y, "platformer_characters", "tile_0003.png");
        enemy.setScale(SCALE);
        enemy.setCollideWorldBounds(false); // 不再需要世界边界碰撞
        enemy.setVelocityX(100); // 初始速度
        enemy.setBounce(0); // 不需要反弹
        enemy.direction = 1; // 1表示右，-1表示左
        enemy.patrolRange = 200; // 巡逻范围
        enemy.originX = point.x; // 记录初始位置
    });
    
 
    
    // 碰撞检测
    this.physics.add.collider(this.enemies, this.groundLayer);
    this.physics.add.collider(
        my.sprite.player, 
        this.enemies, 
        (player, enemy) => {
            // 计算反弹方向
            let bounceDirection = (player.x < enemy.x) ? -1 : 1;
            
            // 设置玩家被弹开的速度
            player.body.setVelocityX(400 * bounceDirection); // 水平反弹
            player.body.setVelocityY(-300); // 向上弹跳
            
            // 可以在这里添加受伤效果或减少生命值
            player.tint = 0xff0000; // 短暂变红表示受伤
            this.time.delayedCall(200, () => {
                player.tint = 0xffffff; // 恢复颜色
            });
        },
        null,
        this
    );

    }

    update() {
        if(cursors.left.isDown) {
            // TODO: have the player accelerate to the left
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

        } else if(cursors.right.isDown) {
            // TODO: have the player accelerate to the right
            my.sprite.player.body.setAccelerationX(this.ACCELERATION);

            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

        } else {
            // TODO: set acceleration to 0 and have DRAG take over
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);

            my.sprite.player.anims.play('idle');
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

        }

        this.enemies.getChildren().forEach(enemy => {
            // 检查是否超出巡逻范围
            if (Math.abs(enemy.x - enemy.originX) > enemy.patrolRange) {
                enemy.direction *= -1; // 改变方向
            }
            
            // 设置速度
            enemy.setVelocityX(100 * enemy.direction);
            
            // 翻转精灵朝向
            if (enemy.direction > 0) {
                enemy.setFlipX(true); // 向右移动时不翻转
            } else {
                enemy.setFlipX(false); // 向左移动时翻转
            }
            
            // 播放行走动画
            enemy.anims.play('enemyWalk', true);
            
            // 检查是否走到平台边缘
            const nextX = enemy.x + (enemy.width * 0.5 * enemy.direction);
            const nextY = enemy.y + enemy.height;
            
            // 获取下一帧位置的瓦片
            const tileBelow = this.groundLayer.getTileAtWorldXY(nextX, nextY);
            
            // 如果没有地面瓦片，转向
            if (!tileBelow || !tileBelow.properties.collides) {
                enemy.direction *= -1;
            }
        });
    }
}