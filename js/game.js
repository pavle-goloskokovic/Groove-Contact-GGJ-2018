var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1b1464',
    parent: 'phaser-example',
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            gravity: {
                y: 2
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var ball;
var cursors;
var audio;

var onGround = false;


var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('ball', 'assets/images/wizball.png');
    //this.load.image('platform', 'assets/sprites/platform.png');

    this.load.audio('joyride', [
        'assets/audio/CatAstroPhi_shmup_normal.ogg',
        'assets/audio/CatAstroPhi_shmup_normal.mp3'
    ]);
}

function create ()
{
    audio = this.sound.add('joyride');
    audio.play();

    //drawWaveform.call(this);

    //this.matter.world.setBounds();

    this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {

        /*bodyA.gameObject.setTint(0xff0000);
        bodyB.gameObject.setTint(0x00ff00);*/
        if(bodyA.gameObject.name === 'ball' || bodyB.gameObject.name === 'ball')
        {
            console.log(' onGround = true');

            onGround = true;
        }

    });

    this.matter.world.on('collisionactive', function (event, bodyA, bodyB) {

        /*bodyA.gameObject.setTint(0xff0000);
        bodyB.gameObject.setTint(0x00ff00);*/
        if(bodyA.gameObject.name === 'ball' || bodyB.gameObject.name === 'ball')
        {
            console.log(' onGround = true');

            onGround = true;
        }

    });

    this.matter.world.on('collisionend', function (event, bodyA, bodyB) {

        if(bodyA.gameObject.name === 'ball' || bodyB.gameObject.name === 'ball')
        {
            console.log('onGround = false');

            onGround = false;
        }

    });

    ball = this.matter.add.image(0, 0, 'ball');

    ball.name = 'ball';
    ball.visible = false;

    ball.setBody({
        type: 'polygon',
        sides: 7,
        radius: 64
    });
    ball.setScale(0.4);
    ball.setFriction(0.1);
    ball.setBounce(0.1);
    ball.setVelocityX(1);
    ball.setAngularVelocity(0.15);

    this.cameras.main.startFollow(ball);

    var data = getWaveformData2();

    /*for(var i=0; i<data.length; i++)
    {
        this.matter.add.fromVertices(i, 300, [{x:0, y: 0}, {x:0, y: -data[i]}, {x: 1, y:-data[i]}, {x:1, y: 0}], {
            isStatic: true,
            render: {
                fillStyle: '#2e2b44',
                strokeStyle: '#2e2b44',
                lineWidth: 1
            }
        }, true, 0.01, 10);
    }*/

    //var waveform = [{x: 0, y: 0}, {x: 0, y: -100}, /!*{x: 30, y: 50}, {x: 60, y: 75},*!/ {x: 60, y: 10},{x: 40, y: 20},{x: 30, y: -20},{x: 0, y: 0}];

    /*var ground = this.matter.add.fromVertices(0, 300, this.matter.world.fromPath(data), {
        isStatic: true,
        render: {
            fillStyle: '#2e2b44',
            strokeStyle: '#2e2b44',
            lineWidth: 1
        }
    }, true, 0.01, 10);*/


    /*var ground = this.matter.add.image(400, 400, 'platform');

    ground.setStatic(true);
    ground.setScale(2, 0.5);
    ground.setAngle(10);
    ground.setFriction(0.005);*/

    var yScale = 400;

    for(var i=0; i<data.length-1; i++)
    {
        var vertices = [];

        vertices.push({x: 0, y: 0});
        vertices.push({x: 0, y: -data[i]*yScale});
        vertices.push({x: 100, y: -data[i+1]*yScale});
        vertices.push({x: 100, y: 0});

        var center = Phaser.Physics.Matter.Matter.Vertices.centre(vertices);

        var asdawd = this.matter.add.fromVertices(i*100 + center.x, 600 + center.y, vertices, {
            isStatic: true,
            render: {
                fillStyle: '#2e2b44',
                strokeStyle: '#2e2b44',
                lineWidth: 1
            }
        }, true, 0.01, 10)
    }

    cursors = this.input.keyboard.createCursorKeys();

}

function update (time, delta)
{

    var v = 800 / 60;
    /*if (ball.y > 600)
    {
        ball.setPosition(50, 0);
        ball.setVelocity(0, 0);
    }*/

    if (cursors.left.isDown)
    {
        var vel = ball.body.velocity.x - 0.5;
        /*if(vel < 1)
        {
            vel = 1;
        }*/
        ball.setVelocityX(vel);

        if(onGround){
            ball.setVelocityY(-2);
        }
    }
    else if (cursors.right.isDown)
    {
        var vel = ball.body.velocity.x + 0.5;
        /*if(vel > 10)
        {
            vel = 10;
        }*/
        ball.setVelocityX(vel);

        if(onGround || ball.body.velocity.x < 0.5){
            console.log('up');

            ball.setVelocityY(-2);
        }
    }
    else
    {
        //ball.setVelocityX(1);
    }

    /*if (cursors.up.isDown)
    {
        ball.setVelocityY(-2);
    }
    else if (cursors.down.isDown)
    {
        ball.setVelocityY(2);
    }
    else
    {
        //ball.setVelocityY(1);
    }*/

    var seek = (ball.x / (audio.duration*800)) * audio.duration;

    if(!audio.isPlaying){
        audio.play({
            seek: seek
        })
    }
    else
    {
        audio.seek = seek;
    }

    //console.log(ball.body.velocity.x);
    //console.log(seek);

}

function getWaveformData()
{
    var data = audio.audioBuffer.getChannelData(0);

    var result = '0, 0, ' ;

    var numOfBuckets = 800;
    var perBucket = Math.ceil(data.length/numOfBuckets);

    var globalMin = 0;
    var globalMax = 0;

    for(var i = 0; i < numOfBuckets; i++)
    {
        var min = 0;
        var max = 0;

        var count = i < numOfBuckets-1 ? perBucket : data.length - perBucket*(numOfBuckets-1);
        for(var j = 0; j < count; j++)
        {
            var value = data[i*perBucket + j];
            if(value< min)
            {
                min = value;
            }
            else if (value > max)
            {
                max = value;
            }
        }
        result += i + ', ' + (-max*100) + ', ';

        if(min< globalMin)
        {
            globalMin = min;
        }
        else if (max > globalMax)
        {
            globalMax = max;
        }
    }

    result += numOfBuckets + ', 0';

    return result;
}

function getWaveformData2 ()
{
    var data = audio.audioBuffer.getChannelData(0);

    var results = [];

    var perBucket = 6000;
    var numOfBuckets = data.length / perBucket;

    var value = 0;
    var max = 0;

    for(var j = 0; j < perBucket/2; j++)
    {
        value = data[j];

        if (value > max)
        {
            max = value;
        }
    }

    results.push(max);

    max = 0;

    for(var i = 0; i < numOfBuckets-1; i++)
    {
        for(j = 0; j < perBucket; j++)
        {
            value = data[i*perBucket + j];

            if (value > max)
            {
                max = value;
            }
        }

        results.push(max);

        max = 0;
    }

    for(j = (numOfBuckets - 0.5) * perBucket; j < numOfBuckets * perBucket; j++)
    {
        value = data[j];

        if (value > max)
        {
            max = value;
        }
    }

    results.push(max);

    return results
}

function drawWaveform()
{
    var data = audio.audioBuffer.getChannelData(0);

    var result = [];

    var numOfBuckets = 800;
    var perBucket = Math.ceil(data.length/numOfBuckets);

    var graphics = this.add.graphics({
        x: 0,
        y: 300
    });
    graphics.lineStyle(1, 0x00FF00, 1.0);
    graphics.beginPath();

    var globalMin = 0;
    var globalMax = 0;

    for(var i = 0; i < numOfBuckets; i++)
    {
        var min = 0;
        var max = 0;

        var count = i < numOfBuckets-1 ? perBucket : data.length - perBucket*(numOfBuckets-1);
        for(var j = 0; j < count; j++)
        {
            var value = data[i*perBucket + j];
            if(value< min)
            {
                min = value;
            }
            else if (value > max)
            {
                max = value;
            }
        }
        result.push({
            min: min,
            max: max
        });

        if(min< globalMin)
        {
            globalMin = min;
        }
        else if (max > globalMax)
        {
            globalMax = max;
        }

        graphics.moveTo(i, -max * 100);
        graphics.lineTo(i, - min * 100);


    }

    graphics.closePath();
    graphics.strokePath();
}
