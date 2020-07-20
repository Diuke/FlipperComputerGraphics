const GRAVITY = -0.01;
const FRICTION = 0;
const fps = 60;
const flipperMoveSpeed = 15;
const BOUNCE = 0.75;

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
        this.xAcceleration = 0;
        this.zAcceleration = 0;
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

    update(){

        this.z += this.zSpeed;
        this.x += this.xSpeed;
        
        console.log(this.xSpeed + ", " + this.zSpeed);
        
        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, 0.0, 0.0, 1.0);
    }

    getWorldMatrix(){
        return this.worldMatrix;
    }
    
    collides(walls){
        for(var i=0; i < walls.length; i++) {
            // logic goes here

            // bottom bound / floor
            if (this.z <= walls[i].line && (walls[i].type == 'wallS1' ||  walls[i].type == 'wallS2')) {
                if(this.x <= walls[i].l1 && this.x >= walls[i].l2){
                    this.z = walls[i].line;
                    this.zSpeed *= -BOUNCE;
                    this.xSpeed *=FRICTION;
                }else{
                    //this.initBallPosition();
                    //this.applyForce(0.05,1);
                }
            }
            // top bound / ceiling
            if (walls[i].type == 'wallB2' && this.z  >= walls[i].line) {
                this.z = walls[i].line;
                console.log('entro');
                this.zSpeed *= -BOUNCE;
                this.xSpeed *=FRICTION;
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
        
            // reset insignificant amounts to 0
            if (this.xSpeed < 0.001 && this.xSpeed > -0.001) {
                this.xSpeed = 0
            }
            if (this.ZSpeed < 0.001 && this.ZSpeed > -0.001) {
                this.ZSpeed = 0
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
