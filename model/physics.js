const GRAVITY = -0.003;
const FRICTION = 0.00005;
const CENTER_DRAG = 0.0003;
const fps = 60;
const flipperMoveSpeed = 8;
const BOUNCE = 0.65;
const CENTER_X = -0.2;
const BUMPER_BOUNCE = 1.50;
const MAX_SPEED_UP = 0.2;
const MAX_SPEED_DOWN = 0.15;

let lives = 3;
let score = 0;

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

        if(this.x == 0){this.xSpeed = 0.001}
        if(this.Z == 0){this.ZSpeed = 0.001}

        if(this.z < -4.3728 && (this.x > 0.79947 || this.x < -1.40053)){
            if((this.xSpeed < 0.005 && this.xSpeed > 0) || (this.xSpeed > -0.005 && this.xSpeed < 0)){
                if(this.x > CENTER_X){this.xSpeed -= CENTER_DRAG*4}
                if(this.x < CENTER_X){this.xSpeed += CENTER_DRAG*4}
            } 
        }

        //maximum speed
        if(this.xSpeed > MAX_SPEED_DOWN) this.xSpeed = MAX_SPEED_DOWN;
        if(this.xSpeed < -MAX_SPEED_DOWN) this.xSpeed = -MAX_SPEED_DOWN;
        if(this.zSpeed > MAX_SPEED_UP) this.zSpeed = MAX_SPEED_UP;
        if(this.zSpeed < -MAX_SPEED_DOWN) this.zSpeed = -MAX_SPEED_DOWN;

        //console.log(this.xSpeed + ", " + this.zSpeed);
        this.z += this.zSpeed; 
        this.x += this.xSpeed;
        
        //console.log(this.xSpeed + ", " + this.zSpeed);-----REMOVE WHEN FINISHED
        
        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, 0.0, 0.0, 1.0);
    }

    getWorldMatrix(){
        return this.worldMatrix;
    }

    dist(a, b){
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
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
                    lives--;
                    var lives_disp = document.getElementById("lives-display");
                    lives_disp.innerHTML = lives;
                    puller.initialPos();
                    puller.count = 0;
                    this.restore();
                    if(lives == 0){
                        var overlay = document.getElementById("overlay");
                        overlay.classList.add("show");
                        overlay.classList.remove("hide");
                    }
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
                let nx = bumpers[j].x - this.x;
                let nz = bumpers[j].z - this.z;
                let r = this.dist([this.x, this.z],[nx, nz]);
                let v = [this.xSpeed, this.zSpeed];
                let theta = Math.atan2(nz, nx);
                let normal = [Math.cos(theta), Math.sin(theta)];

                console.log(nx, nz, r, v, theta, normal);

                let dot = v[0] * normal[0] + v[1] * normal[1];
          
                let newSpeed = [(v[0] - (2*dot*normal[0]) ), (v[1] - (2*dot*normal[1]) )];
                console.log(newSpeed);

                this.xSpeed = newSpeed[0] * BUMPER_BOUNCE;
                this.zSpeed = newSpeed[1] * BUMPER_BOUNCE;

                score += 10;
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
        if(lives > 0){
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
                console.log(xStart, zStart);
                ball.applyForce(xStart, zStart);
                ballPushed = true;
            }
            this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, -90.0, 0.0, 1.0);

        }
    }
}

class Flipper{
    worldMatrix = null;
    moveSpeed = 0.5;
    maxAngle = 70;

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
        let z_fix = 0.2;
        if(this.side == 'right'){
            return [
                [-0.35, -5.95+z_fix],
                [-1.35, -5.25+z_fix],
                [-1.6, -5.79+z_fix],
                [-0.7064075049514779, -6.091632952294785]
            ];
        } else {
            return [
                [0.91, -5.19+z_fix],
                [-0.3, -5.89+z_fix],
                [-0.006407504951477752, -6.091632952294785],
                [0.9, -5.69+z_fix]
            ];
        }
    }

    getAxis(){
        if(this.side == 'right'){
            return [-1.3, -5.6+0.2];
        } else {
            return [0.7, -5.6+0.2];
        }
        
    }

    pointOnLine(A, B, p){
        var a_to_p = [p[0] - A[0], p[1] - A[1]];
        var a_to_b = [B[0] - A[0], B[1] - A[1]];
        var atb2 = Math.pow(a_to_b[0], 2) + Math.pow(a_to_b[1], 2);
        var dot = a_to_p[0]*a_to_b[0] + a_to_p[1]*a_to_b[1];
        var t = dot / atb2;
        return [A[0] + a_to_b[0]*t , A[1] + a_to_b[1]*t];
    }

    closestPointToHitbox(hitbox, ball){
        console.log("hitbox");
        console.log(hitbox[0], hitbox[1], hitbox[2], hitbox[3]);
        var hitbox_u = this.pointOnLine(hitbox[0], hitbox[1], ball);
        var hitbox_r = this.pointOnLine(hitbox[1], hitbox[2], ball);
        var hitbox_d = this.pointOnLine(hitbox[2], hitbox[3], ball);
        var hitbox_l = this.pointOnLine(hitbox[3], hitbox[0], ball);
        console.log("Hitbox intersections");
        console.log(hitbox_u, hitbox_r, hitbox_d, hitbox_l);

        var dist_u = this.dist(ball, hitbox_u);
        var dist_r = this.dist(ball, hitbox_r);
        var dist_d = this.dist(ball, hitbox_d);
        var dist_l = this.dist(ball, hitbox_l);

        if(dist_u <= dist_r && dist_u <= dist_d && dist_u <= dist_l) return hitbox_u;
        if(dist_r <= dist_u && dist_r <= dist_d && dist_r <= dist_l) return hitbox_r;
        if(dist_d <= dist_u && dist_d <= dist_r && dist_d <= dist_l) return hitbox_d;
        if(dist_l <= dist_u && dist_l <= dist_r && dist_l <= dist_d) return hitbox_l;
        
        
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
            var ball_p = [ball.x, ball.z]
            var collisionPoint = this.closestPointToHitbox(this.hitbox, ball_p);
            console.log("collision point");
            console.log(collisionPoint);
            console.log("ball");
            ball.x = collisionPoint[0];
            ball.z = collisionPoint[1];

            let v = [ball.xSpeed, ball.zSpeed];
            let x1 = this.hitbox[0];
            let x2 = this.hitbox[1];
            let d = this.dist(x2, x1);
            let normal = [(x2[1] - x1[1]) / d, -(x2[0] - x1[0]) / d];

            let dot = v[0] * normal[0] + v[1] * normal[1];
          
            let newSpeed = [(v[0] - (2*dot*normal[0]) ), (v[1] - (2*dot*normal[1]) )];

            console.log(v, newSpeed);

            if(this.isMovingUp && !this.isOnFinalPos){
                //ball.applyForce(-ball.xSpeed + 0.4, -ball.zSpeed + 0.4)
                ball.xSpeed = newSpeed[0] * BUMPER_BOUNCE*1.5;
                ball.zSpeed = newSpeed[1] * BUMPER_BOUNCE*1.5;
            } else {
                ball.xSpeed = newSpeed[0] * BOUNCE;
                ball.zSpeed = newSpeed[1] * BOUNCE;
            }
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

function restart(){
    lives = 3;
    var overlay = document.getElementById("overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    var lives_disp = document.getElementById("lives-display");
    lives_disp.innerHTML = lives;
}