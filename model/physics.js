const GRAVITY = -0.01;
const FRICTION = 0.00005;
const CENTER_DRAG = 0.002;
const fps = 60;
const flipperMoveSpeed = 15;
const BOUNCE = 0.75;
const CENTER_X = -0.2;
const BUMPER_BOUNCE = 1.25;

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
        this.z = -5.9728;
    }

    applyForce(fX, fZ){
        this.xSpeed += fX;
        this.zSpeed += fZ;
        
    }

    updateMove(){
        this.z += this.zSpeed; 
        this.x += this.xSpeed;
        console.log(this.x + ", " + this.z);

        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, 0.0, 0.0, 1.0);
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
                this.zSpeed *= -BOUNCE;
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
                    this.initBallPosition();
                    puller.initialPos();
                    puller.count = 0;
                    this.xSpeed = 0;
                    this.zSpeed = 0;
                    isPlaying = false;
                    ballPushed = false;
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
            if(this.count < 18){
                this.count += 1;
                this.z -= 0.05;
            }
            console.log(this.count);           
            isPlaying = true;
        }else if(puller_hold == false && this.count > 0 && isPlaying == true && ballPushed==false){
            while(this.z < -7){
                this.z += 0.05;
            }        
            ball.applyForce(0, this.count/30);
            ballPushed = true;
        }
        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, -90.0, 0.0, 1.0);

    }
}

class Flipper{
    worldMatrix = null;
    moveSpeed = 0.5;

    hitbox = [];

    constructor(x, y, z, a1, a2, a3, side){
        this.side = side;
        this.angle = 0;
        this.maxAngle = 45;
        this.angleSpeed = 0;
        this.worldMatrix = utils.MakeWorld(x, y, z, a1, a2, a3, 1.0);
        this.isMovingUp = false;
        this.isMovingDown = false;
        this.isOnFinalPos = false;
        this.isOnInitPos = true;
    }

    getWorldMatrix(){
        return this.worldMatrix;
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
            this.worldMatrix = utils.multiplyMatrices(this.worldMatrix, rotate);
        }
        
    }
}
