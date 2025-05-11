class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");

         const animatedTiles = this.map.filterTiles(tile => tile.properties.animated);
    this.anims.create({
        key: 'water',
        frames: [
            { tileId: 34 }, // 替换为你的水瓦片ID
            { tileId: 35 },
            { tileId: 36 }
        ],
        frameRate: 5,
        repeat: -1
    });
    
    animatedTiles.forEach(tile => {
        tile.anim = this.anims.create({
            key: `tileAnim_${tile.x}_${tile.y}`,
            frames: this.anims.generateFrameNumbers('tilemap_tiles', {
                frames: [34, 35, 36] // 替换为你的水瓦片ID序列
            }),
            frameRate: 5,
            repeat: -1
        });
        tile.anim.play();
    });

    this.anims.create({
        key: 'enemyWalk',
        frames: this.anims.generateFrameNames('platformer_characters', {
            prefix: "tile_",
            start: 3,
            end: 4,
            suffix: ".png",
            zeroPad: 4
        }),
        frameRate: 5,
        repeat: -1
    });
    }


    // Never get here since a new scene is started in create()
    update() {
    }
}