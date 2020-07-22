const GRAVITY = -0.005;
const FRICTION = 0.00005;
const CENTER_DRAG = 0.0009;
const fps = 60;
const flipperMoveSpeed = 15;
const BOUNCE = 0.65;
const CENTER_X = -0.2;
const BUMPER_BOUNCE = 1.10;
const MAX_SPEED = 0.4;

class Ball {
    //BALL ONLY MOVES IN:
    // Z -> UP AND DOWN (POSITIVE UP - NEGATIVE DOWN)
    // X -> LEFT AND RIGHT (POSITIVE LEFT - NEGATIVE RIGHT)
    worldMatrix = null;
    constructor(){
        this.initBallPosition();
        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, 0.0, 0.0, 1.0);
        this.xSpeed = 0;
        this.zSpeed = 0;
        this.mass = 1;
    }

    initBallPosition(){
        this.x = -2.5;
        this.y = 8.5335;
        this.z = -5;
    }

    applyForce(fX, fZ){
        this.xSpeed += fX;
        this.zSpeed += fZ;
        
    }

    updateMove(){
        this.z += this.zSpeed; 
        this.x += this.xSpeed;
        if(this.zSpeed != 0 || this.xSpeed != 0){
            console.log(this.x + ", " + this.z);
        }

        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, 0.0, 0.0, 1.0);
    }

    restore(){
        this.initBallPosition();
        this.xSpeed = 0;
        this.zSpeed = 0;
        isPlaying = false;
        ballPushed = false;
    }

    update(){
        //Gravity just for Z
        this.zSpeed += GRAVITY;

        //Friction in Z
        if(this.zSpeed > 0){this.zSpeed -= FRICTION;}
        else if(this.zSpeed < 0){this.zSpeed += FRICTION;}
        else {this.zSpeed += 0;}

        //Friction in X
        if(this.xSpeed > 0){this.xSpeed -= FRICTION;}
        else if(this.xSpeed < 0){this.xSpeed += FRICTION;}
        else {this.xSpeed += 0;}
        
        if(this.x > CENTER_X){this.xSpeed -= CENTER_DRAG}
        if(this.x < CENTER_X){this.xSpeed += CENTER_DRAG}

        if(this.z < -4.4728){
            if((this.xSpeed < 0.00005 && this.xSpeed > 0) || (this.xSpeed > -0.00005 && this.xSpeed < 0)){
                if(this.x > CENTER_X){this.xSpeed -= CENTER_DRAG*5}
                if(this.x < CENTER_X){this.xSpeed += CENTER_DRAG*5}
            } 
        }

        //maximum speed
        if(this.xSpeed > MAX_SPEED) this.xSpeed = MAX_SPEED;
        if(this.xSpeed < -MAX_SPEED) this.xSpeed = -MAX_SPEED;
        if(this.zSpeed > MAX_SPEED) this.zSpeed = MAX_SPEED;
        if(this.zSpeed < -MAX_SPEED) this.zSpeed = -MAX_SPEED;

        //console.log(this.xSpeed + ", " + this.zSpeed);
        this.z += this.zSpeed; 
        this.x += this.xSpeed;
        
        //console.log(this.xSpeed + ", " + this.zSpeed);-----REMOVE WHEN FINISHED
        
        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, 0.0, 0.0, 1.0);
    }

    getWorldMatrix(){
        return this.worldMatrix;
    }
    
    collides(walls, bumpers, puller){
        for(var i=0; i < walls.length; i++) {
            // logic goes here

            // bottom bound / floor
            if (this.z <= walls[i].line && this.z >= (walls[i].line - 0.5) && (walls[i].type == 'wallS1' ||  walls[i].type == 'wallS2')) {
                if(this.x <= walls[i].l1 && this.x >= walls[i].l2){
                    this.z = walls[i].line;
                    this.zSpeed *= -BOUNCE;
                    //this.xSpeed *=FRICTION;
                }                
            }
            // top bound / ceiling
            if (walls[i].type == 'wallB2' && this.z  >= walls[i].line) {
                this.z = walls[i].line;
                //console.log('entro'); -----REMOVE WHEN FINISHED
                //this.zSpeed *= -BOUNCE;
                this.zSpeed *= -1;
                //this.xSpeed *=FRICTION;
            }
        
            // left bound
            if (walls[i].type == 'wallB1' && this.x  >= walls[i].line) {
                this.x = walls[i].line;
                this.xSpeed *= -BOUNCE;
            }
            // right bound
            if (walls[i].type == 'wallB3' && this.x  <= walls[i].line) {
                this.x = walls[i].line;
                this.xSpeed *= -BOUNCE;
            }
            //bottom --- game over
            if(walls[i].type == 'wallGO' && this.z <= walls[i].line){
                if(this.x <= walls[i].l1 && this.x >= walls[i].l2){
                    console.log('game over');
                    puller.initialPos();
                    puller.count = 0;
                    this.restore();
                }
            }
        
            // reset insignificant amounts to 0
            if (this.xSpeed < 0.001 && this.xSpeed > -0.001) {
                this.xSpeed = 0
            }
            if (this.ZSpeed < 0.001 && this.ZSpeed > -0.001) {
                this.ZSpeed = 0
            }
        
    
        }
        //check for all bumpers if radius < distance btw bumper center and current position
        for(var j=0; j < bumpers.length; j++){
            if(Math.sqrt(Math.pow((bumpers[j].x - this.x),2) + Math.pow((bumpers[j].z - this.z), 2)) <= bumpers[j].r ){
                //this.x = bumpers[j].x+bumpers[j].r;
                console.log('BUMPER'+bumpers[j].name);
                this.xSpeed *= -BUMPER_BOUNCE;
                this.zSpeed *= -BUMPER_BOUNCE;
            }

        }
        
    }
}

class Wall{    
    constructor(l1,l2,line, type){
        //l1 = limit 1, l2 = limit 2, line = x or y position of the wall
        this.l1 = l1;
        this.l2 = l2;
        this.line = line;      
        this.type = type;  
    }
}

class Bumper{
    constructor(x, z, r, name){
        this.x = x;
        this.z = z;
        this.r = r;
        this.name = name;
    }
}

class Puller{
    constructor(){
        this.initialPos();
        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, -90.0, 0.0, 1.0);
        this.count = 0;
    }
    initialPos(){
        this.x = -2.5264;
        this.y = 8.3925;
        this.z = -7;
    }

    getWorldMatrix(){
        return this.worldMatrix;
    }

    update(puller_hold, ball){
        if(puller_hold == true && ballPushed == false){
            if(this.count < 20){
                this.count += 0.5;
                this.z -= 0.02;
            }
            console.log(this.count);           
            isPlaying = true;
        }else if(puller_hold == false && this.count > 0 && isPlaying == true && ballPushed==false){
            while(this.z < -7){
                this.z += 0.05;
            }        

            //Launch
            var xStart = Math.random()/10;
            //var zStart = this.count/25;
            var zStart = this.count/40;
            ball.applyForce(xStart, zStart);
            ballPushed = true;
        }
        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, -90.0, 0.0, 1.0);

    }
}

class Flipper{
    worldMatrix = null;
    moveSpeed = 0.5;
    maxAngle = 60;

    constructor(x, y, z, a1, a2, a3, side){
        this.side = side;
        this.x = x;
        this.y = y;
        this.z = z;
        this.hitbox = this.getHitbox();
        this.axis = this.getAxis();
        this.area = this.calculateArea();
        this.angle = 0;
        this.angleSpeed = 0;
        this.worldMatrix = utils.MakeWorld(x, y, z, a1, a2, a3, 1.0);
        this.isMovingUp = false;
        this.isMovingDown = false;
        this.isOnFinalPos = false;
        this.isOnInitPos = true;
    }

    dist(a, b){
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }

    calculateArea(){
        var area1 = this.calcTriangle(this.hitbox[0], this.hitbox[1], this.hitbox[3]);
        var area2 = this.calcTriangle(this.hitbox[1], this.hitbox[2], this.hitbox[3]);
        return area1 + area2;
    }

    getHitbox(){
        if(this.side == 'right'){
            return [
                [-0.4, -5.4-0.49],
                [-1.6, -4.5-0.49],//4.5
                [-1.6, -5.3-0.49],
                [-0.5, -5.8-0.49]
            ];
        } else {
            return [
                [0.9, -4.8-0.49],
                [-0.3, -5.4-0.49],//-5.4
                [-0.1, -5.8-0.49],
                [0.9, -5.2-0.49]
            ];
        }
    }

    getAxis(){
        if(this.side == 'right'){
            return [-1.3, -5.1];
        } else {
            return [0.7, -5.1];
        }
        
    }

    collision(ball){
        var point = [ball.x, ball.z];
        var threshold = 0.0005;
        var area1 = this.calcTriangle(point, this.hitbox[0], this.hitbox[1]);
        var area2 = this.calcTriangle(point, this.hitbox[1], this.hitbox[2]);
        var area3 = this.calcTriangle(point, this.hitbox[2], this.hitbox[3]);
        var area4 = this.calcTriangle(point, this.hitbox[3], this.hitbox[0]);
        var complete = area1 + area2 + area3 + area4;
        //console.log(complete + ", " + this.area + ", " + this.side);
        if(complete <= this.area + threshold){
            if(this.isMovingUp){
                ball.xSpeed *= -BUMPER_BOUNCE * 1.5;
                ball.zSpeed *= -BUMPER_BOUNCE * 1.5;
            } else {
                ball.xSpeed *= -BOUNCE;
                ball.zSpeed *= -BOUNCE;
            }
            var ball_angle = Math.atan2(ball.y, ball.x);
            console.log(ball_angle);
            ball.x += 0.01;
            ball.z += 0.01;
            console.log("collide" + this.side);
        }
    }

    calcTriangle(p1, p2, m){
        var a = this.dist(m, p1);
        var b = this.dist(m, p2);
        var c = this.dist(p1, p2);
        var s = (a+b+c)/2;
        return Math.sqrt(s*(s-a)*(s-b)*(s-c));
    }

    getWorldMatrix(){
        return this.worldMatrix;
    }

    rotoTranslate(p, rotation, translation, minus_translation){
        var temp = utils.multiplyMatrices(translation, rotation);
        temp = utils.multiplyMatrices(temp, minus_translation);
        temp = utils.multiplyMatrixVector(temp, p);
        return temp;
    }

    update(){
        if(this.isMovingUp){
            if(!this.isOnFinalPos){
                this.angle += flipperMoveSpeed;
                if(this.side == 'left'){
                    this.angleSpeed = -flipperMoveSpeed;
                } else { //right
                    this.angleSpeed = flipperMoveSpeed;
                }
            } else {
                this.angleSpeed = 0;
            }
        } else if(this.isMovingDown){
            if(!this.isOnInitPos){
                this.angle -= flipperMoveSpeed;
                if(this.side == 'left'){
                    this.angleSpeed = flipperMoveSpeed;
                } else { //right
                    this.angleSpeed = -flipperMoveSpeed;
                }
            } else {
                this.angleSpeed = 0;
            }
        } else {
            this.angleSpeed = 0;
        }
        if(this.angle >= this.maxAngle) {
            this.isOnFinalPos = true;
            this.angle = this.maxAngle;
        }
        else if(this.angle <= 0){
            this.angle = 0;
            this.isMovingDown = false;
            this.isMovingUp = false;
            this.isOnInitPos = true;
        } else {
            this.isOnInitPos = false;
            this.isOnFinalPos = false;
        }
        if(this.angleSpeed != 0){
            var rotate = utils.MakeRotateYMatrix(this.angleSpeed);
            var translate = utils.MakeTranslateMatrix(this.axis[0], this.y, this.axis[1]);
            var minus_translate = utils.MakeTranslateMatrix(-this.axis[0], -this.y, -this.axis[1]);
            var p0 = [this.hitbox[0][0], this.y, this.hitbox[0][1], 1];
            var p1 = [this.hitbox[1][0], this.y, this.hitbox[1][1], 1];
            var p2 = [this.hitbox[2][0], this.y, this.hitbox[2][1], 1];
            var p3 = [this.hitbox[3][0], this.y, this.hitbox[3][1], 1];

            var h0 = this.rotoTranslate(p0, rotate, translate, minus_translate);
            var h1 = this.rotoTranslate(p1, rotate, translate, minus_translate);
            var h2 = this.rotoTranslate(p2, rotate, translate, minus_translate);
            var h3 = this.rotoTranslate(p3, rotate, translate, minus_translate);

            this.hitbox[0] = [h0[0], h0[2]];
            this.hitbox[1] = [h1[0], h1[2]];
            this.hitbox[2] = [h2[0], h2[2]];
            this.hitbox[3] = [h3[0], h3[2]];
            
            this.worldMatrix = utils.multiplyMatrices(this.worldMatrix, rotate);
        }
    }
}
