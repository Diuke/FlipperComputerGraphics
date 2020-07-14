const G = -0.0002;
const FRICTION = 0.0001;
const fps = 60;

class Ball {
    //BALL ONLY MOVES IN:
    // Z -> UP AND DOWN (POSITIVE UP - NEGATIVE DOWN)
    // X -> LEFT AND RIGHT (POSITIVE LEFT - NEGATIVE RIGHT)
    worldMatrix = null;
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, 0.0, 0.0, 1.0);
        this.xSpeed = 0;
        this.zSpeed = 0;
        this.xAcceleration = 0;
        this.zAcceleration = 0;
    }

    applyForce(fX, fZ){
        this.xAcceleration += fX;
        this.zAcceleration += fZ;
    }

    update(){
        let frictionX = 0;
        if(this.xAcceleration > 0) frictionX = -FRICTION;
        else if(this.xAcceleration < 0) frictionX = FRICTION;

        let frictionZ = 0;
        if(this.zAcceleration > 0) frictionZ = -FRICTION;
        else if(this.zAcceleration < 0) frictionZ = FRICTION;

        this.zAcceleration += G + frictionZ;
        this.xAcceleration += frictionX;
        this.zSpeed = this.zSpeed + this.zAcceleration;
        this.xSpeed = this.xSpeed + this.xAcceleration;
        this.z = this.z + this.zSpeed;
        this.x = this.x + this.xSpeed;
        console.log(this.xSpeed + ", " + this.zSpeed);
        
        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, 0.0, 0.0, 1.0);
    }

    getWorldMatrix(){
        return this.worldMatrix;
    }
    
}