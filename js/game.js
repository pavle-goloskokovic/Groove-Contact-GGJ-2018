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
var spaceButton;
var audio;

var onGround = false;

var preHookVelocity;
var hookInProgress = false;

var trail = [];
var trailGraphics;

var thrust;

var text;
var score = 10000;

var ended = false;

var endExplosion;

var game = new Phaser.Game(config);

function preload ()
{
    text = this.add.text(10, 10, 'Loading...', { font: '26px \'VT323\', monospace', fill: '#ffffff' });

    this.load.image('ball', 'assets/images/wizball.png');
    //this.load.image('platform', 'assets/sprites/platform.png');

    this.load.image('jets', 'assets/images/yellow.png');


    this.load.audio('joyride', [
        'assets/audio/Amnesty - Love Fades.mp3'
    ]);
    this.load.audio('end', [
        'assets/audio/Amnesty - Love Fades -full.mp3'
    ]);
}

function endCelebration()
{
    endExplosion.setPosition(ball.x, ball.y);
    endExplosion.explode(8, ball.x /*+ Phaser.Math.Between(128, 672)*/, ball.y /*+ Phaser.Math.Between(28, 572)*/);

    this.time.delayedCall(100, endCelebration, [], this);
}

function create ()
{
    audio = this.sound.add('joyride');
    audio.once('ended', function ()
    {
        ended = true;

        this.sound.play('end');

        endCelebration.call(this);

        hookInProgress = false;

    }, this);
    audio.play();

    trailGraphics = this.add.graphics({
        x: 0,
        y: 0
    });

    thrust = this.add.particles('jets').createEmitter({
        x: 1600,
        y: 200,
        angle: { min: 160, max: 200 },
        scale: { start: 0.2, end: 0 },
        blendMode: 'ADD',
        lifespan: 600,
        on: false
    });

    endExplosion = this.add.particles('jets').createEmitter({
        lifespan: 1000,
        speed: { min: 300, max: 400 },
        alpha: { start: 1, end: 0 },
        scale: { start: 0.5, end: 0 },
        rotate: { start: 0, end: 360, ease: 'Power2' },
        blendMode: 'ADD',
        on: false
    });

    //drawWaveform.call(this);

    //this.matter.world.setBounds();

    this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {

        /*bodyA.gameObject.setTint(0xff0000);
        bodyB.gameObject.setTint(0x00ff00);*/
        if(bodyA.gameObject.name === 'ball' || bodyB.gameObject.name === 'ball')
        {

            if((!hookInProgress && spaceButton.isDown)) {

                hookInProgress = true;

                score -= 100;

                preHookVelocity = {
                    x: ball.body.velocity.x,
                    y: ball.body.velocity.y
                };

                ball.setVelocityX(20);
                ball.setVelocityY(-10);

                event.pairs.forEach(function (pair) {
                    pair.isActive = false;
                });
            }else if(hookInProgress) {

                event.pairs.forEach(function (pair) {
                    pair.isActive = false;
                });
            }

        }

    }, this);

    this.matter.world.on('collisionactive', function (event, bodyA, bodyB) {

        /*bodyA.gameObject.setTint(0xff0000);
        bodyB.gameObject.setTint(0x00ff00);*/
        if(bodyA.gameObject.name === 'ball' || bodyB.gameObject.name === 'ball')
        {

            if((!hookInProgress && spaceButton.isDown)) {

                hookInProgress = true;

                score -= 100;

                preHookVelocity = {
                    x: ball.body.velocity.x,
                    y: ball.body.velocity.y
                };

                ball.setVelocityX(20);
                ball.setVelocityY(-10);

                event.pairs.forEach(function (pair) {
                    pair.isActive = false;
                });
            }
            else if(hookInProgress) {

                event.pairs.forEach(function (pair) {
                    pair.isActive = false;
                });
            }
        }

    }, this);

    /* this.matter.world.on('collisionend', function (event, bodyA, bodyB) {

         if((bodyA.gameObject.name === 'ball' || bodyB.gameObject.name === 'ball')
         )
         {
             activeCollisions--;

             if(activeCollisions === 0)
             {
                 console.log('onGround = false');

                 onGround = false;

                 if(hookInProgress)
                 {
                     hookInProgress = false;

                     ball.body.velocity.x = preHookVelocity.x;
                     ball.body.velocity.y = preHookVelocity.y;
                     preHookVelocity = null;
                 }
             }

             console.log('activeCollisions = ' + activeCollisions);

         }

     });*/

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

    var vertices = [];

    vertices.push({x: 0, y: 0});
    vertices.push({x: 0, y: -data[0]*yScale});
    vertices.push({x: 600, y: -data[0]*yScale});
    vertices.push({x: 600, y: 0});

    var center = Phaser.Physics.Matter.Matter.Vertices.centre(vertices);

    this.matter.add.fromVertices(-600 + center.x, 600 + center.y, vertices, {
        isStatic: true,
        render: {
            fillStyle: '#2e2b44',
            strokeStyle: '#2e2b44',
            lineWidth: 1
        }
    }, true, 0.01, 10);

    for(var i=0; i<data.length-1; i++)
    {
        vertices = [];

        vertices.push({x: 0, y: 0});
        vertices.push({x: 0, y: -data[i]*yScale});
        vertices.push({x: 100, y: -data[i+1]*yScale});
        vertices.push({x: 100, y: 0});

        center = Phaser.Physics.Matter.Matter.Vertices.centre(vertices);

        this.matter.add.fromVertices(i*100 + center.x, 600 + center.y, vertices, {
            isStatic: true,
            render: {
                fillStyle: '#2e2b44',
                strokeStyle: '#2e2b44',
                lineWidth: 1
            }
        }, true, 0.01, 10)
    }

    cursors = this.input.keyboard.createCursorKeys();

    spaceButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    //sendCelebration.call(this);
}

function update (time, delta)
{


    onGround = this.matter.world.engine.pairs.collisionActive.length > 0
        || this.matter.world.engine.pairs.collisionStart.length > 0;

    if(hookInProgress){

        if(!onGround)
        {
            hookInProgress = false;

            ball.body.velocity.x = preHookVelocity.x;
            ball.body.velocity.y = preHookVelocity.y;
            preHookVelocity = null;
        }
        else
        {
            ball.setVelocityY(-10);

            thrust.setPosition(ball.x += 16, ball.y);
            thrust.setSpeed(ball.body.velocity.x / 2);
            thrust.emitParticle(16);
        }
    }
    else
    {
        /*if(spaceButton.isDown && onGround)
        {
            hookInProgress = true;

            preHookVelocity = {
                x: ball.body.velocity.x,
                y: ball.body.velocity.y
            };

            ball.setVelocityX(20);
            ball.setVelocityY(-10);

            this.matter.world.engine.pairs.collisionActive.forEach(function (pair) {
                pair.isActive = false;
            });
        }
        else
        {*/
        var v = 800 / 60;
        /*if (ball.y > 600)
        {
            ball.setPosition(50, 0);
            ball.setVelocity(0, 0);
        }*/

        if(ended)
        {
            ball.setVelocityY(-2);
            //ball.setVelocityX(1);
        }
        else if (cursors.left.isDown)
        {
            var vel = ball.body.velocity.x - 0.5;
            /*if(vel < 1)
            {
                vel = 1;
            }*/
            ball.setVelocityX(vel);

            if(onGround && !hookInProgress){
                ball.setVelocityY(-2);
            }
        }
        else if (cursors.right.isDown)
        {
            var vel = ball.body.velocity.x + 2.5;
            /*if(vel > 10)
            {
                vel = 10;
            }*/
            ball.setVelocityX(vel);

            if((onGround || ball.body.velocity.x < 0.5) && !hookInProgress){
                //console.log('up');

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

        //console.log(ball.body.velocity.x);
        //console.log(seek);
        //}
    }

    var seek = (ball.x / (audio.duration*800)) * audio.duration;

    if(!hookInProgress && !ended)
    {
        score -= (Math.abs(seek-audio.seek)*1000)/delta * 10;
    }

    text.setText(Math.round(score));

    /*if(!audio.isPlaying){
        audio.play({
            seek: seek
        })
    }
    else
    {*/
    audio.seek = seek;
    //}

    trail.unshift({
        position: {x: ball.x, y: ball.y},
        speed: ball.body.speed
    });

    trailGraphics.clear();

    for (var i = 0; i < trail.length; i += 1) {
        var point = trail[i].position,
            speed = trail[i].speed;

        var hue = Math.round(Math.min(1, speed / 20) * 255);
        //console.log(hue);



        //render.context.fillStyle = 'hsl(' + hue + ', 100%, 55%)'; // a 0.7
        trailGraphics.fillStyle(rgbToHex(255, hue, 26), 0.7);
        //render.context.fillRect(point.x, point.y, 2, 2);
        trailGraphics.fillCircle(point.x, point.y, 2);
    }

    if (trail.length > 200) {
        trail.pop();
    }

    text.x = ball.x - 40;
    text.y = ball.y - 60;

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

function hslToRgb(h, s, l){
    var r, g, b;

    if(s === 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return rgbToHex(r * 255, g * 255, b * 255);
}


function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return parseInt("0x" + componentToHex(r) + componentToHex(g) + componentToHex(b), 16);
}
