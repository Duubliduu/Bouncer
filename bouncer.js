// The game
var game = new Phaser.Game(
    240,
    320,
    Phaser.AUTO,
    '',
    {
        preload: preload,
        create: create,
        update: update
    }
);

var animationSpeed = 5,
    player,
    jumping = false,
    platforms,
    falling = true,
    levels = [],
    background,
    position = {x:0, y:0};

// Preload assets
function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.spritesheet('spritesheet', 'assets/spritesheet.png', 24, 32);
}


function newMap() {

    var newLevel = [];

    if (platforms !== undefined) {
        platforms.removeAll();
    }
    platforms = game.add.group();
    platforms.enableBody = true;

    for (var i = 0; i < Math.ceil(Math.random()*20); i++) {
        var x = Math.floor(Math.random() * 10) * 24,
            y = Math.floor(Math.random() * 9 + 1) * 32,
            ground = game.add.sprite(x, y, 'spritesheet');

        newLevel.push({x:x, y:y})

        ground.animations.add('Idle',[5], false);
        ground.animations.play('Idle');
        game.physics.arcade.enable(ground);
        ground.body.checkCollision.down = false;
        ground.body.checkCollision.right = false;
        ground.body.checkCollision.left = false;
        ground.body.immovable = true;
        ground.body.height = 31;
        ground.body.offset = new Phaser.Point(0,1);
        platforms.add(ground);
    }

    levels.push({
        x: position.x,
        y: position.y,
        map: newLevel,
        visits: 1
    });
}

function oldMap(map) {

    if (platforms !== undefined) {
        platforms.removeAll();
    }

    platforms = game.add.group();
    platforms.enableBody = true;

    for (var i in map) {
        var x = map[i].x,
            y = map[i].y,
            ground = game.add.sprite(x, y, 'spritesheet');

        map[i].visits++;

        ground.animations.add('Idle',[5], false);
        ground.animations.play('Idle');

        game.physics.arcade.enable(ground);
        ground.body.checkCollision.down = false;
        ground.body.checkCollision.right = false;
        ground.body.checkCollision.left = false;
        ground.body.immovable = true;
        ground.body.height = 31;
        ground.body.offset = new Phaser.Point(0,1);
        platforms.add(ground);
    }
}

function getMap() {

    // background.position.x = -((background.width / 2) + (position.x * 20));
    // background.position.y = -((background.height / 2) + (position.y * 20));

    for (var i in levels) {
        if (levels.hasOwnProperty(i)) {
            if (levels[i].x == position.x && levels[i].y == position.y) {
                oldMap(levels[i].map);
                return;
            }
        }
    }

    newMap();
}

// Create game
function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    background = game.add.sprite(0, 0, 'sky');

    getMap();

    player = game.add.sprite(32, game.world.height - 150, 'spritesheet');
    player.direction = 'Left';

    // Physics
    game.physics.arcade.enable(player);
    player.body.gravity.y = 1000;
    player.body.width = 12;
    player.body.offset = new Phaser.Point(6,0);

    // Right
    player.animations.add('IdleRight', [0], animationSpeed, true);
    player.animations.add('JumpRight', [1], animationSpeed, false);
    player.animations.add('MoveRight', [7,8,9,8], animationSpeed, true);
    player.animations.add('JumpingRight', [6], animationSpeed, true);

    // Left
    player.animations.add('IdleLeft', [15], animationSpeed, true);
    player.animations.add('JumpLeft', [14], animationSpeed, false);
    player.animations.add('MoveLeft', [12,11,10,11], animationSpeed, true);
    player.animations.add('JumpingLeft', [13], animationSpeed, true);


    star = game.add.sprite(0,0,'spritesheet');
    star.animations.add('Idle', [2,3,2,4], animationSpeed, true);
    star.animations.play('Idle');

    controls = game.input.keyboard.createCursorKeys();
}

// Update state
function update() {

    game.physics.arcade.collide(player, platforms);

    if (player.position.x > game.world.width) {
        player.position.x = -24;
        position.x+=1;
        getMap();
    }

    if (player.position.x < -24) {
        player.position.x = game.world.width;
        position.x-=1;
        getMap();
    }

    if (player.position.y > game.world.height) {
        player.position.y = -32;
        position.y+=1;
        getMap();
    }

    if (player.position.y < -32) {
        player.position.y = game.world.height - 32;
        position.y-=1;
        getMap();
    }


    if (player.body.touching.down) {
        jumping = false;
        falling = false;
    }

    if (player.body.velocity.y > 0) {

        player.animations.play('Jumping' + player.direction);
        falling = true;

    } else if (player.body.velocity.y < 0) {

        player.animations.play('Jump' + player.direction);

    } else if (player.body.velocity.x !== 0 && jumping === false) {

        player.animations.play('Move' + player.direction);

    } else {
        player.animations.play('Idle' + player.direction);
    }

    if (controls.right.isDown) {
        player.body.velocity.x = 100;
        player.direction = 'Right';
    } else if (controls.left.isDown) {
        player.body.velocity.x = -100;
        player.direction = 'Left';
    } else {
        player.body.velocity.x = 0;
    }

    if (controls.up.isDown && jumping === false && falling === false) {
        player.body.velocity.y = -600;
        jumping = true;
    }
}
