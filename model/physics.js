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
        this.z = this.z + this.zSpeed;
        this.x = this.x + this.xSpeed;
        console.log(this.x + ", " + this.z);
        
        this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, 0.0, 0.0, 0.0, 1.0);
    }

    getWorldMatrix(){
        return this.worldMatrix;
    }
    
    collidesWall(walls){
        for(var i=0; i < size(walls); i++) {
            if(this.x == walls(i).line && walls(i).type == 0){
                this.xSpeed = -1*this.xSpeed;
            }else if(this.y == walls(i).line && walls(i).type == 1){
                this.zSpeed = -1*this.zSpeed;
            }        
        }
        
    }
}

class Wall{    
    constructor(l1,l2,line, type){
        //l1 = limit 1, l2 = limit 2, line = x or y position of the wall, type = 0 if vertical and 1 if horizontal
        this.l1 = l1;
        this.l2 = l2;
        this.line = line;      
        this.type = type;  
    }
}