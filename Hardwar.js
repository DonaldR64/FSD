const CC = (() => {
    const version = '2025.8.4';
    if (!state.Hardwar) {state.Hardwar = {}};

    const pageInfo = {};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    let HexSize, HexInfo, DIRECTIONS;

    //math constants
    const M = {
        f0: Math.sqrt(3),
        f1: Math.sqrt(3)/2,
        f2: 0,
        f3: 3/2,
        b0: Math.sqrt(3)/3,
        b1: -1/3,
        b2: 0,
        b3: 2/3,
    }


    const DefineHexInfo = () => {
        HexSize = (70 * pageInfo.scale)/M.f0;
        if (pageInfo.type === "hex") {
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: 35 * pageInfo.scale,
                    y: HexSize,
                },
                width: 70  * pageInfo.scale,
                height: pageInfo.scale*HexSize,
                xSpacing: 70 * pageInfo.scale,
                ySpacing: 3/2 * HexSize,
                directions: {
                    "Northeast": new Cube(1,-1,0),
                    "East": new Cube(1,0,-1),
                    "Southeast": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "West": new Cube(-1,0,1),
                    "Northwest": new Cube(0,-1,1),
                },
                halfToggleX: 35 * pageInfo.scale,
                halfToggleY: 0,
            }
            DIRECTIONS = ["Northeast","East","Southeast","Southwest","West","Northwest"];
        } else if (pageInfo.type === "hexr") {
            //Hex H or Flat Topped
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: HexSize,
                    y: 35 * pageInfo.scale,
                },
                width: pageInfo.scale*HexSize,
                height: 70  * pageInfo.scale,
                xSpacing: 3/2 * HexSize,
                ySpacing: 70 * pageInfo.scale,
                directions: {
                    "North": new Cube(0, -1, 1),
                    "Northeast": new Cube(1, -1, 0),
                    "Southeast": new Cube(1,0,-1),
                    "South": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "Northwest": new Cube(-1,0,1),
                },
                halfToggleX: 0,
                halfToggleY: 35 * pageInfo.scale,
            }
            DIRECTIONS = ["North","Northeast","Southeast","South","Southwest","Northwest"];
        }
    }


    let UnitArray = {};
    let PlayerInfo = {};
    let currentPlayer = 0;
    let currentUnitID = "";
    let combatArray = {};

    let outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};

    const playerCodes = {
        "Don": "2520699",
        "DonAlt": "5097409",
        "Ted": "6951960",
        "Vic": "4892",
        "Ian": "4219310",
    }

    const PlayerIDs = () => {
        let players = Object.keys(playerCodes);
        for (let i=0;i<players.length;i++) {
            let roll20ID = playerCodes[players[i]];
            let playerObj = findObjs({_type:'player',_d20userid: roll20ID})[0];
            if (playerObj) {
                PlayerInfo[playerObj.get("id")] = players[i];
            }
        }
    }

    const Factions = {
        "Syndicate": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/324272729/H0Ea79FLkZIn-3riEhuOrA/thumb.png?1674441877",
            "backgroundColour": "#FF0000",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#FFFF00",
            "borderStyle": "5px groove",
        },
        "Consortium": {
            "image": "https://files.d20.io/images/450605832/fYnsnux8MJaOVMog-SXcmA/thumb.png?1753805707",
            "backgroundColour": "#123293",
            "titlefont": "Bokor",
            "fontColour": "#FFFFFF",
            "borderColour": "#000000",
            "borderStyle": "5px double",

        },

        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "dice": "UK",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
            "objectiveImages": ["https://s3.amazonaws.com/files.d20.io/images/445305278/d0gD6ulV_LWL6GqXLHl4Lg/thumb.png?1750123999","https://s3.amazonaws.com/files.d20.io/images/445305279/Qlfo7DUpfqQytnDDj1iNFw/thumb.png?1750124000","https://s3.amazonaws.com/files.d20.io/images/445305282/dDimDBtHc8VQCygdSvUsqA/thumb.png?1750123999","https://s3.amazonaws.com/files.d20.io/images/445305281/N-hzu0glUwi30tzyPJrmHA/thumb.png?1750123999","https://s3.amazonaws.com/files.d20.io/images/445305280/Km2iwf_F-BC_5ZBf0EaJ8A/thumb.png?1750123999"],

        },

    };

    const SM = {
        "alert": "status_blue", 
        "digin": "status_brown", 
        "immobilized": "status_red",
        "disarmed": "status_purple",
        "deactivated": "status_green",
        "spotting": "status_red",
    }





    //height is height of terrain element
    //elevation is 0 by default
    //traits pull out mobility or Los features

    const TerrainInfo = {
        "Woods": {name: "Woods",height: 2, traits: ["Difficult","Foliage","Flammable"]},
        "Burning Woods": {name: "Burning Woods",height: 3, traits: ["Dangerous","Smoke (sustained)"]},
        "Scrub": {name: "Scrub",height: 1, traits: ["Rough","Foliage","Flammable"]},
        "Burning Scrub": {name: "Burning Scrub",height: 2, traits: ["Dangerous","Smoke"]},

        "Building 1": {name: "Building", height: 1, traits: ["Building","Solid"]},

        "Rubble": {name: "Rubble",height: 0, traits: ["Rough"]},

        "Ruins": {name: "Ruins",height: 1, traits: ["Hazardous","Open Structure"]},


        "Hill 1": {name: "Hill 1",height: 0,elevation:1},
        "Hill 2": {name: "Hill 2",height: 0, elevation:2},
        "Hill 3": {name: "Hill 3",height: 0, elevation:3},

        "Water 0": {name: "Water 0",height: 0, traits: ["Hazardous","Water","Depth 0"]},
        "Water 1": {name: "Water 1",height: 0, traits: ["Hazardous","Water","Depth 1"]},
        "Water 2": {name: "Water 2",height: 0, traits: ["Hazardous","Water","Depth 2"]},
        "Water 3": {name: "Water 3",height: 0, traits: ["Hazardous","Water","Depth 3"]},

    }

    const EdgeInfo = {
        "Hedge": {name: "Hedge",height: 0.5, traits: ["Difficult","Foliage","Flammable"]},
        "Burning Hedge": {name: "Burning Hedge",height: 1.5, traits: ["Dangerous","Smoke"]},
        "Wall": {name: "Wall",height: 0.5, traits: ["Difficult","Low Structure"]},
        "Stream": {name: "Stream",height: 0, traits: ["Water","Difficult"]},




    }








    const simpleObj = (o) => {
        let p = JSON.parse(JSON.stringify(o));
        return p;
    };

    const getCleanImgSrc = (imgsrc) => {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };

    const tokenImage = (img) => {
        //modifies imgsrc to fit api's requirement for token
        img = getCleanImgSrc(img);
        img = img.replace("%3A", ":");
        img = img.replace("%3F", "?");
        img = img.replace("med", "thumb");
        return img;
    };

    const DeepCopy = (variable) => {
        variable = JSON.parse(JSON.stringify(variable))
        return variable;
    };

    const PlaySound = (name) => {
        let sound = findObjs({type: "jukeboxtrack", title: name})[0];
        if (sound) {
            sound.set({playing: true,softstop:false});
        }
    };

    const FX = (fxname,model1,model2) => {
        //model2 is target, model1 is shooter
        //if its an area effect, model1 isnt used
        if (fxname.includes("System")) {
            //system fx
            fxname = fxname.replace("System-","");
            if (fxname.includes("Blast")) {
                fxname = fxname.replace("Blast-","");
                spawnFx(model2.token.get("left"),model2.token.get("top"), fxname);
            } else {
                spawnFxBetweenPoints(new Point(model1.token.get("left"),model1.token.get("top")), new Point(model2.token.get("left"),model2.token.get("top")), fxname);
            }
        } else {
            let fxType =  findObjs({type: "custfx", name: fxname})[0];
            if (fxType) {
                spawnFxBetweenPoints(new Point(model1.token.get("left"),model1.token.get("top")), new Point(model2.token.get("left"),model2.token.get("top")), fxType.id);
            }
        }
    }


    const translatePoly = (poly) => {
        //translate points in a pathv2 polygon to map points
        let vertices = [];
        let points = JSON.parse(poly.get("points"));
        let centre = new Point(poly.get("x"), poly.get("y"));
        //covert path points from relative coords to actual map coords
        //define 'bounding box;
        let minX = Infinity,minY = Infinity, maxX = 0, maxY = 0;
        _.each(points,pt => {
            minX = Math.min(pt[0],minX);
            minY = Math.min(pt[1],minY);
            maxX = Math.max(pt[0],maxX);
            maxY = Math.max(pt[1],maxY);
        })
        //translate each point back based on centre of box
        let halfW = (maxX - minX)/2 + minX;
        let halfH = (maxY - minY)/2 + minY
        let zeroX = centre.x - halfW;
        let zeroY = centre.y - halfH;
        _.each(points,pt => {
            let x = Math.round(pt[0] + zeroX);
            let y = Math.round(pt[1] + zeroY);
            vertices.push(new Point(x,y));
        })
        return vertices;
    }












    //Retrieve Values from character Sheet Attributes
    const Attribute = (character,attributename) => {
        //Retrieve Values from character Sheet Attributes
        let attributeobj = findObjs({type:'attribute',characterid: character.id, name: attributename})[0]
        let attributevalue = "";
        if (attributeobj) {
            attributevalue = attributeobj.get('current');
        }
        return attributevalue;
    };

    const AttributeArray = (characterID) => {
        let aa = {}
        let attributes = findObjs({_type:'attribute',_characterid: characterID});
        for (let j=0;j<attributes.length;j++) {
            let name = attributes[j].get("name")
            let current = attributes[j].get("current")   
            if (!current || current === "") {current = " "} 
            aa[name] = current;
            let max = attributes[j].get("max")   
            if (!max || max === "") {max = " "} 
            aa[name + "_max"] = max;
        }
        return aa;
    };

    const AttributeSet = (characterID,attributename,newvalue,max) => {
        if (!max) {max = false};
        let attributeobj = findObjs({type:'attribute',characterid: characterID, name: attributename})[0]
        if (attributeobj) {
            if (max === true) {
                attributeobj.set("max",newvalue)
            } else {
                attributeobj.set("current",newvalue)
            }
        } else {
            if (max === true) {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    max: newvalue,
                    characterid: characterID,
                });            
            } else {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    characterid: characterID,
                });            
            }
        }
        return attributeobj.id;
    };

    const DeleteAttribute = (characterID,attributeName) => {
        let attributeObj = findObjs({type:'attribute',characterid: characterID, name: attributeName})[0]
        if (attributeObj) {
            attributeObj.remove();
        }
    }

    class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        };
        toOffset() {
            let cube = this.toCube();
            let offset = cube.toOffset();
            return offset;
        };
        toCube() {
            let x = this.x - HexInfo.pixelStart.x;
            let y = this.y - HexInfo.pixelStart.y;
            let q,r;
            if (pageInfo.type === "hex") {
                q = (M.b0 * x + M.b1 * y) / HexInfo.size;
                r = (M.b3 * y) / HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                q = (M.b3 * x) / HexInfo.size;
                r = (M.b1 * x + M.b0 * y) / HexInfo.size;
            }
            let cube = new Cube(q,r,-q-r).round();
            return cube;
        };
        distance(b) {
            return Math.sqrt(((this.x - b.x) * (this.x - b.x)) + ((this.y - b.y) * (this.y - b.y)));
        }
        label() {
            return this.toCube().label();
        }
    }

    class Offset {
        constructor(col,row) {
            this.col = col;
            this.row = row;
        }
        label() {
            let label = rowLabels[this.row] + (this.col + 1).toString();
            return label;
        }
        toCube() {
            let q,r;
            if (pageInfo.type === "hex") {
                q = this.col - (this.row - (this.row&1))/2;
                r = this.row;
            } else if (pageInfo.type === "hexr") {
                q = this.col;
                r = this.row - (this.col - (this.col&1))/2;
            }
            let cube = new Cube(q,r,-q-r);
            cube = cube.round(); 
            return cube;
        }
        toPoint() {
            let cube = this.toCube();
            let point = cube.toPoint();
            return point;
        }
    };

    const Angle = (theta) => {
        while (theta < 0) {
            theta += 360;
        }
        while (theta >= 360) {
            theta -= 360;
        }
        return theta
    }   

    class Cube {
        constructor(q,r,s) {
            this.q = q;
            this.r =r;
            this.s = s;
        }

        add(b) {
            return new Cube(this.q + b.q, this.r + b.r, this.s + b.s);
        }
        angle(b) {
            //angle between 2 hexes
            let origin = this.toPoint();
            let destifaction = b.toPoint();

            let x = Math.round(origin.x - destifaction.x);
            let y = Math.round(origin.y - destifaction.y);
            let phi = Math.atan2(y,x);
            phi = phi * (180/Math.PI);
            phi = Math.round(phi);
            phi -= 90;
            phi = Angle(phi);
            return phi;
        }        
        subtract(b) {
            return new Cube(this.q - b.q, this.r - b.r, this.s - b.s);
        }
        static direction(direction) {
            return HexInfo.directions[direction];
        }
        neighbour(direction) {
            //returns a hex (with q,r,s) for neighbour, specify direction eg. hex.neighbour("NE")
            return this.add(HexInfo.directions[direction]);
        }
        neighbours() {
            //all 6 neighbours
            let results = [];
            for (let i=0;i<DIRECTIONS.length;i++) {
                results.push(this.neighbour(DIRECTIONS[i]));
            }
            return results;
        }

        len() {
            return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
        }
        distance(b) {
            return this.subtract(b).len();
        }
        lerp(b, t) {
            return new Cube(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
        }
        linedraw(b) {
            //returns array of hexes between this hex and hex 'b'
            var N = this.distance(b);
            var a_nudge = new Cube(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
            var b_nudge = new Cube(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 0; i < N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }
        label() {
            let offset = this.toOffset();
            let label = offset.label();
            return label;
        }
        radius(rad) {
            //returns array of hexes in radius rad
            //Not only is x + y + z = 0, but the absolute values of x, y and z are equal to twice the radius of the ring
            let results = [];
            let h;
            for (let i = 0;i <= rad; i++) {
                for (let j=-i;j<=i;j++) {
                    for (let k=-i;k<=i;k++) {
                        for (let l=-i;l<=i;l++) {
                            if((Math.abs(j) + Math.abs(k) + Math.abs(l) === i*2) && (j + k + l === 0)) {
                                h = new Cube(j,k,l);
                                results.push(this.add(h));
                            }
                        }
                    }
                }
            }
            return results;
        }

        ring(radius) {
            let results = [];
            let b = new Cube(-1 * radius,0,1 * radius);  //start at west 
            let cube = this.add(b);
            for (let i=0;i<6;i++) {
                //for each direction
                for (let j=0;j<radius;j++) {
                    results.push(cube);
                    cube = cube.neighbour(DIRECTIONS[i]);
                }
            }
            return results;
        }

        round() {
            var qi = Math.round(this.q);
            var ri = Math.round(this.r);
            var si = Math.round(this.s);
            var q_diff = Math.abs(qi - this.q);
            var r_diff = Math.abs(ri - this.r);
            var s_diff = Math.abs(si - this.s);
            if (q_diff > r_diff && q_diff > s_diff) {
                qi = -ri - si;
            }
            else if (r_diff > s_diff) {
                ri = -qi - si;
            }
            else {
                si = -qi - ri;
            }
            return new Cube(qi, ri, si);
        }
        toPoint() {
            let x,y;
            if (pageInfo.type === "hex") {
                x = (M.f0 * this.q + M.f1 * this.r) * HexInfo.size;
                y = 3/2 * this.r * HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                x = 3/2 * this.q * HexInfo.size;
                y = (M.f1 * this.q + M.f0 * this.r) * HexInfo.size;
            }
            x += HexInfo.pixelStart.x;
            y += HexInfo.pixelStart.y;
            let point = new Point(x,y);
            return point;
        }
        toOffset() {
            let col,row;
            if (pageInfo.type === "hex") {
                col = this.q + (this.r - (this.r&1))/2;
                row = this.r;
            } else if (pageInfo.type === "hexr") {
                col = this.q;
                row = this.r + (this.q - (this.q&1))/2;
            }
            let offset = new Offset(col,row);
            return offset;
        }
        whatDirection(b) {
            let delta = new Cube(b.q - this.q,b.r - this.r, b.s - this.s);
            let dir = "Unknown";
            let keys = Object.keys(HexInfo.directions);
            for (let i=0;i<6;i++) {
                let d = HexInfo.directions[keys[i]];
                if (d.q === delta.q && d.r === delta.r && d.s === delta.s) {
                    dir = keys[i];
                }
            }
            return dir
        }

     
    };

    class Hex {
        constructor(point) {
            this.centre = point;
            let offset = point.toOffset();
            this.offset = offset;
            this.tokenIDs = [];
            this.cube = offset.toCube();
            this.label = offset.label();

            this.traits = ["Plain"];
            this.elevation = 0;
            this.terrainHeight = 0;
            this.edges = {};
            _.each(DIRECTIONS,a => {
                this.edges[a] = "Open";
            })
            this.terrain = ["Open"]


            HexMap[this.label] = this;
        }
    }

    class Unit {
        constructor(id) {
            let token = findObjs({_type:"graphic", id: id})[0];
            let location = new Point(token.get("left"),token.get("top"));
            let cube = location.toCube();
            let label = cube.label();
            let charID = token.get("represents");
            let char = getObj("character", charID); 

            let aa = AttributeArray(charID);
  

            this.token = token;
            this.name = token.get("name");
            this.charName = char.get("name");
            this.id = id;
            this.charID = charID;
            this.hexLabel = label;
            this.startHexLabel = label; //used to track movement

            this.faction = aa.faction || "Neutral";
            this.player = (this.faction === "Neutral") ? 2:(state.Hardwar.factions[0] === this.faction)? 0:1;

            this.class = parseInt(aa.class);
            this.type = aa.type;

            this.mobility = parseInt(aa.mobility) || 0;
            this.mobilityMax = parseInt(aa.mobility_max) || 0;
            this.firepower = parseInt(aa.firepower) || 0;
            this.firepowerMax = parseInt(aa.firepower_max) || 0;
            this.armour = parseInt(aa.armour) || 0;
            this.armourMax = parseInt(aa.armour_max) || 0;
            this.defence = parseInt(aa.defence) || 0;
            this.defenceMax = parseInt(aa.defence_max) || 0;           
            let damage = parseInt(aa.damage) || (this.class * 2);
            this.damage = damage;
            this.targettingUnitID = "";

            let weapons = [];

            for (let i=0;i<3;i++) {
                let w=i+1;
                let wname = "weapon" + w + "name";
                wname = aa[wname];
                if (!wname || wname === undefined || wname === null) {continue};
                let wabilities = "weapon" + w + "abilities" || " ";
                wabilities = aa[wabilities];
                let weapon = {
                    name: wname,
                    abilities: wabilities,
                    fx: "weapon" + w + "fx",
                    sound: "weapon" + w + "sound",
                }
                weapons.push(weapon);
            }
            this.weapons = weapons;
log(this.name)
log(this.weapons)
            this.abilities = aa.abilities || " ";

            this.order = "";


            UnitArray[id] = this;
            HexMap[label].tokenIDs.push(id);






        }


        Damage () {
            let hits = combatArray.totalHits;
            let statDamage = combatArray.statDamage;
            if (hits === 0 && combatArray.statFlag === false) {return};

            if (hits > 0) {
                let hull = this.damage;
                newHull = Math.max(0,hull - hits);
                if (newHull === 0 && hull > 0) {
                    outputCard.body.push("Damage is extensive and no longer Repairable");
                }
                this.damage = newHull;
                AttributeSet(this.charID,"damage",newHull);
            }    

            if (combatArray.statFlag === true) {
                let keys = Object.keys(statDamage);
                _.each(keys,stat => {
                    if (stat === "emp") {
                        this.token.set("bar1_value",0);
                        this.token.set("aura1_color","#000000");
                        this.token.set(SM.spotting, false);
                        this.order = "";
//? any others to stop
                    } else {
                        let damage = statDamage[stat];
                        if (damage > 0) {
                            let num = parseInt(this[stat]);
                            let max = parseInt(this[stat + "Max"]);
                            if (isNaN(max)) {max = 0};
                            num = Math.max(0,num - damage);
                            this[stat] = num;
                            AttributeSet(this.charID,stat,num);
                            if (num === 0 && max > 0) {
                                if (stat === "mobility") {
                                    outputCard.body.push(this.name + ' is Immobilized');
                                    this.token.set(SM.immobilized,true);
                                }
                                if (stat === "firepower") {
                                    outputCard.body.push(this.name + " is Disarmed");
                                    this.token.set(SM.disarmed,true);
                                }
                                if (stat === "armour") {
                                    outputCard.body.push(this.name + ' is Destroyed!');
                                    this.Destroyed();
                                }
                                if (stat === "defence") {
                                    outputCard.body.push(this.name + ' is Deactivated');
                                    this.token.set(SM.deactivated,true);
                                }
                            }
                        }
                    }
                })
            }






        }


        Destroyed () {
            //turn into a wreck if appropriate and place on map layer, update HexMap 


        }













    }





    const AddAbility = (abilityName,action,characterID) => {
        createObj("ability", {
            name: abilityName,
            characterid: characterID,
            action: action,
            istokenaction: true,
        })
    }    

    const AddAbilities = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let type = msg.content.split(";")[1];
        let faction = msg.content.split(";")[2];

        let id = msg.selected[0]._id;
        let token = findObjs({_type:"graphic", id: id})[0];

        let charID = token.get("represents");
        if (!charID) {
            sendChat("","No Associated Character for this Token");
            return;
        }
        let char = getObj("character", charID);   


        sendChat("","Abilities Added")
    }


    const ButtonInfo = (phrase,action,inline) => {
        //inline - has to be true in any buttons to have them in same line -  starting one to ending one
        if (!inline) {inline = false};
        let info = {
            phrase: phrase,
            action: action,
            inline: inline,
        }
        outputCard.buttons.push(info);
    };

    const SetupCard = (title,subtitle,side) => {
        outputCard.title = title;
        outputCard.subtitle = subtitle;
        outputCard.side = side;
        outputCard.body = [];
        outputCard.buttons = [];
        outputCard.inline = [];
    };

    const DisplayDice = (roll,tablename,size) => {
        roll = roll.toString();
        let table = findObjs({type:'rollabletable', name: tablename})[0];
        if (!table) {
            table = findObjs({type:'rollabletable', name: "Neutral"})[0];
        }
        let obj = findObjs({type:'tableitem', _rollabletableid: table.id, name: roll })[0];        
        let avatar = obj.get('avatar');
        let out = "<img width = "+ size + " height = " + size + " src=" + avatar + "></img>";
        return out;
    };

    const PrintCard = (id) => {
        let output = "";
        if (id) {
            let playerObj = findObjs({type: 'player',id: id})[0];
            let who = playerObj.get("displayname");
            output += `/w "${who}"`;
        } else {
            output += "/desc ";
        }

        if (!outputCard.side || !Factions[outputCard.side]) {
            outputCard.side = "Neutral";
        }

        //start of card
        output += `<div style="display: table; border: ` + Factions[outputCard.side].borderStyle + " " + Factions[outputCard.side].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: center; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Factions[outputCard.side].backgroundColour + `; `;
        output += `background-image: url(` + Factions[outputCard.side].image + `), url(` + Factions[outputCard.side].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: center,center; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="`;
        output += `font-family: ` + Factions[outputCard.side].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Factions[outputCard.side].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Factions[outputCard.side].fontColour + `; `;
        output += `">` + outputCard.subtitle + `</span></div></div></div>`;

        //body of card
        output += `<div style="display: table-row-group; ">`;

        let inline = 0;

        for (let i=0;i<outputCard.body.length;i++) {
            let out = "";
            let line = outputCard.body[i];
            if (!line || line === "") {continue};
            if (line.includes("[INLINE")) {
                let end = line.indexOf("]");
                let substring = line.substring(0,end+1);
                let num = substring.replace(/[^\d]/g,"");
                if (!num) {num = 1};
                line = line.replace(substring,"");
                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + " ";

                for (let q=0;q<num;q++) {
                    let info = outputCard.inline[inline];
                    out += `<a style ="background-color: ` + Factions[outputCard.side].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Factions[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Factions[outputCard.side].borderColour + `; font-family: Tahoma; font-size: x-small; `;
                    out += `"href = "` + info.action + `">` + info.phrase + `</a>`;
                    inline++;                    
                }
                out += `</div></span></div></div>`;
            } else {
                line = line.replace(/\[hr(.*?)\]/gi, '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">');
                line = line.replace(/\[\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\](.*?)\[\/[\#]\]/g, "<span style='color: #$1;'>$2</span>"); // [#xxx] or [#xxxx]...[/#] for color codes. xxx is a 3-digit hex code
                line = line.replace(/\[[Uu]\](.*?)\[\/[Uu]\]/g, "<u>$1</u>"); // [U]...[/u] for underline
                line = line.replace(/\[[Bb]\](.*?)\[\/[Bb]\]/g, "<b>$1</b>"); // [B]...[/B] for bolding
                line = line.replace(/\[[Ii]\](.*?)\[\/[Ii]\]/g, "<i>$1</i>"); // [I]...[/I] for italics
                let lineBack,fontcolour;
                if (line.includes("[F]")) {
                    let ind1 = line.indexOf("[F]") + 3;
                    let ind2 = line.indexOf("[/f]");
                    let fac = line.substring(ind1,ind2);
                    if (Factions[fac]) {
                        lineBack = Factions[fac].backgroundColour;
                        fontcolour = Factions[fac].fontColour;
                    }
                    line = line.replace("[F]" + fac + "[/f]","");

                } else {
                    lineBack = (i % 2 === 0) ? "#D3D3D3": "#EEEEEE";
                    fontcolour = "#000000";
                }
                out += `<div style="display: table-row; background: ` + lineBack + `;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color:` + fontcolour + `; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + `</div></span></div></div>`;                
            }
            output += out;
        }

        //buttons
        if (outputCard.buttons.length > 0) {
            for (let i=0;i<outputCard.buttons.length;i++) {
                let info = outputCard.buttons[i];
                let inline = info.inline;
                if (i>0 && inline === false) {
                    output += '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">';
                }
                let out = "";
                let borderColour = Factions[outputCard.side].borderColour;
                
                if (inline === false || i===0) {
                    out += `<div style="display: table-row; background: #FFFFFF;; ">`;
                    out += `<div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                    out += `"><span style="line-height: normal; color: #000000; `;
                    out += `"> <div style='text-align: center; display:block;'>`;
                }
                if (inline === true) {
                    out += '<span>     </span>';
                }
                out += `<a style ="background-color: ` + Factions[outputCard.side].backgroundColour + `; padding: 5px;`
                out += `color: ` + Factions[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                out += `border-color: ` + borderColour + `; font-family: Tahoma; font-size: x-small; `;
                out += `"href = "` + info.action + `">` + info.phrase + `</a>`
                
                if (inline === false || i === (outputCard.buttons.length - 1)) {
                    out += `</div></span></div></div>`;
                }
                output += out;
            }

        }

        output += `</div></div><br />`;
        sendChat("",output);
        outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};
    }

    //related to building hex map
    const LoadPage = () => {
        //build Page Info and flesh out Hex Info
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width") * 70;
        pageInfo.height = pageInfo.page.get("height") * 70;
        pageInfo.type = pageInfo.page.get("grid_type");

    }

    const BuildMap = () => {
        let startTime = Date.now();
        HexMap = {};

        let startX = HexInfo.pixelStart.x;
        let startY = HexInfo.pixelStart.y;
        let halfToggleX = HexInfo.halfToggleX;
        let halfToggleY = HexInfo.halfToggleY;
        if (pageInfo.type === "hex") {
            for (let j = startY; j <= pageInfo.height;j+=HexInfo.ySpacing){
                for (let i = startX;i<= pageInfo.width;i+=HexInfo.xSpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startX += halfToggleX;
                halfToggleX = -halfToggleX;
            }
        } else if (pageInfo.type === "hexr") {
            for (let i=startX;i<=pageInfo.width;i+=HexInfo.xSpacing) {
                for (let j=startY;j<=pageInfo.height;j+=HexInfo.ySpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startY += halfToggleY;
                halfToggleY = -halfToggleY;
            }
        }
        AddTerrain();    
        AddEdges();
        AddRoads();
        AddTokens();        
        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };





    const AddTerrain = () => {
        //add terrain using tokens
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(tokens,token => {
            let name = token.get("name");
    log(name)
            let terrain = TerrainInfo[name];
            if (terrain) {
                if (!terrain.elevation) {terrain.elevation = 0};
                let centre = new Point(token.get("left"),token.get('top'));
                let centreLabel = centre.toCube().label();
                let hex = HexMap[centreLabel];
                if (hex.terrain.includes("Open")) {
                    hex.terrain = [];
                    hex.traits = [];
                }
                if (hex.terrain.includes(terrain.name) === false) {
                    hex.terrain.push(terrain.name);
                }
                hex.elevation = Math.max(hex.elevation,terrain.elevation);
                hex.terrainHeight = Math.max(terrain.height, hex.terrainHeight);
                if (terrain.traits) {
                    hex.traits = hex.traits.concat(terrain.traits);
                }
            }
        })

    }


    const AddEdges = () => {

 //add other types from edgeinfo

        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});
        _.each(paths,path => {
            let types = {"#0000ff": "Stream","#000000": "Bridge","#00ff00": "Hedge","#980000": "Wall"};
            let type = types[path.get("stroke").toLowerCase()];
            if (type) {
                let vertices = translatePoly(path);
                //work through pairs of vertices
                for (let i=0;i<(vertices.length -1);i++) {
                    let pt1 = vertices[i];
                    let pt2 = vertices[i+1];
                    let midPt = new Point((pt1.x + pt2.x)/2,(pt1.y + pt2.y)/2);
                    //find nearest hex to midPt
                    let hexLabel = midPt.label();
                    //now run through that hexes neighbours and see what intersects with original line to identify the 2 neighbouring hexes
                    let hex1 = HexMap[hexLabel];
                    if (!hex1) {continue}
                    let pt3 = hex1.centre;
                    let neighbourCubes = hex1.cube.neighbours();
                    for (let j=0;j<neighbourCubes.length;j++) {
                        let k = j+3;
                        if (k> 5) {k-=6};
                        let hl2 = neighbourCubes[j].label();
                        let hex2 = HexMap[hl2];
                        if (!hex2) {continue}
                        let pt4 = hex2.centre;
                        let intersect = lineLine(pt1,pt2,pt3,pt4);
                        if (intersect) {
                            if (hex1.edges[DIRECTIONS[j]] !== "Bridge") {
                                hex1.edges[DIRECTIONS[j]] = type;
                            }
                            if (hex2.edges[DIRECTIONS[k]] !== "Bridge") {
                                hex2.edges[DIRECTIONS[k]] = type;
                            }
                        }
                    }
                }
            }
        })
    }
    
    const AddRoads = () => {
        let roads = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",}).filter(el => {
            return el.get("stroke").toLowerCase() === "#ffff00";
        });
        _.each(roads,road => {
            let vertices = translatePoly(road);
            for (let i=0;i<(vertices.length-1);i++) {
                let cube1 = vertices[i].toCube();
                let cube2 = vertices[i+1].toCube();
                let interCubes = cube1.linedraw(cube2);
                _.each(interCubes, cube => {
                    let interHex = HexMap[cube.label()];
                    if (interHex.traits.includes("Road") === false) {
                        interHex.traits.push("Paved");
                        interHex.terrain.push("Road");
                    }
                })
                if (HexMap[cube1.label()].traits.includes("Road") === false) {
                    HexMap[cube1.label()].traits.push("Paved");
                    HexMap[cube1.label()].terrain.push("Road");
                }
                if (HexMap[cube2.label()].traits.includes("Road") === false) {
                    HexMap[cube2.label()].traits.push("Paved");
                    HexMap[cube2.label()].terrain.push("Road");
                }
            }
        })
    }



     
    const AddTokens = () => {
        UnitArray = {};
        //create an array of all tokens
        let start = Date.now();
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });

        let c = tokens.length;
        let s = (1===c?'':'s');     
        
        tokens.forEach((token) => {
            let character = getObj("character", token.get("represents"));   
            if (character) {
                let unit = new Unit(token.id);
            }   
        });




        let elapsed = Date.now()-start;
        log(`${c} token${s} checked in ${elapsed/1000} seconds - ` + Object.keys(UnitArray).length + " placed in Unit Array");

    }

    const DefineOffboard = (token) => {
        let centre = new Point(token.get("left"),token.get('top'));
        let halfW = token.get("width")/2;
        let halfH = token.get("height")/2;
        let minX = centre.x - halfW;
        let maxX = centre.x + halfW;
        let minY = centre.y - halfH;
        let maxY = centre.y + halfH;
        _.each(HexMap,hex => {
            if (hex.centre.x < minX || hex.centre.x > maxX || hex.centre.y < minY || hex.centre.y > maxY) {
                hex.terrain = "Offboard";
                hex.offboard = true;
            }
        })
    }


    const PlaceTarget = (msg) => {
        let Tag = msg.split(";");
        let id = Tag[0];
        let type = Tag[1];
        let unit = UnitArray[id];

        if (type === "Relay") {
            let charID = "-OWqqZirwy4ocuhD9Llb";
            let img = "https://files.d20.io/images/105823565/P035DS5yk74ij8TxLPU8BQ/thumb.png?1582679991";           
            img = getCleanImgSrc(img);
            let newToken = createObj("graphic", {
                left: unit.token.get("left"),
                top: unit.token.get("top"),
                width: 50,
                height: 50, 
                pageid: Campaign().get("playerpageid"),
                imgsrc: img,
                layer: "objects",
                represents: charID,
                name: "Marker",
            })
            let newUnit = new Unit(newToken.id);
            newUnit.targettingUnitID = id;
            log(newUnit)
        }

        




    }

    const Mark = (msg) => {
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return}
        let targettingUnit = UnitArray[unit.targettingUnitID];
        let los = LOS(targettingUnit,unit);
        SetupCard(targettingUnit,"Mark Coordinates",targettingUnit.faction);
        if (los.los === false) {
            outputCard.body.push("Not in LOS, Reposition");
        } else {
            let token = findObjs({_type:"graphic", id: id})[0];
            let newImg = "https://files.d20.io/images/307909216/Cqm8z6ZX2WPDQkodhdLVqQ/thumb.png?1665016507";
            newImg = getCleanImgSrc(newImg);
            token.set({
                imgsrc: newImg,
                layer: "map",
            })        
            toFront(token);
            let player = UnitArray[currentUnitID].player;
            state.Hardwar.rangedIn[player].push(token.get("id"));
            outputCard.body.push("Coordinates Marked");
        }
        PrintCard();
    }


    const AddMarker = (msg) => {
        let id = msg.selected[0]._id;
        let type = msg.content.split(";")[1];
        let token = findObjs({_type:"graphic", id: id})[0];
        let charID,img;
        if (type === "Veteran") {
            charID = "-OSevl13S7Q6iSaFbutR";
        } else if (type === "Suppress") {
            charID = "-OSew5Cn6ReQ0Arco_HQ";
        }
        let char = getObj("character", charID);
        let tokenID = summonToken(char,token.get("left") - 15,token.get('top') - 15,0,40);
        if (tokenID) {
            token = findObjs({_type:"graphic", id: tokenID})[0];
            toFront(token);
        }
    }

    const PlaceSmoke = (msg) => {
        let id = msg.selected[0]._id;
        let playerID = msg.playerid;
        let side = state.Hardwar.players[playerID];

        let token = findObjs({_type:"graphic", id: id})[0];
        let roll = randomInteger(50);
        let level;
        if (roll <= 30) {
            level = Math.ceil(roll/6);
        } else if (roll > 30) {
            roll -= 30;
            level = Math.ceil(roll/4) + 5;
        }
        let charName = "Smoke " + level;
        let character = findObjs({_type: "character", name: charName})[0];
        summonToken(character,token.get('left'),token.get("top"),0,160);
        let smokeAreaName = side + " Smoke";
        let zone = MapAreas[smokeAreaName];
        token.set({
            left: zone.centre.x,
            top: zone.centre.y,
        })
       let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "objects",});
        _.each(tokens,token => {
            if (token.get("name").includes("Smoke")) {
                token.set("disableSnapping",false);
                toBack(token);
            }
        })
    }




    const HexData = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let token = findObjs({_type:"graphic", id: id})[0];
        let point = new Point(token.get("left"),token.get("top"));
        let label = point.label();
        let hex = HexMap[label];
        SetupCard("Info","","Neutral");
        outputCard.body.push("Terrain: " + hex.terrain);
        outputCard.body.push("Elevation: " + hex.elevation);
        outputCard.body.push("Height of Terrain: " + hex.terrainHeight);
        outputCard.body.push("Traits: " + hex.traits);
        for (let i=0;i<6;i++) {
            let edge = hex.edges[DIRECTIONS[i]];
            if (edge !== "Open") {
                outputCard.body.push(edge + " on " + DIRECTIONS[i] + " Edge");
            }
        }
        PrintCard();
    }



    const DrawLine = (hex1,hex2) => {
        let x1 = hex1.centre.x;
        let x2 = hex2.centre.x;
        let y1 = hex1.centre.y;
        let y2 = hex2.centre.y;

        let x = (x1+x2)/2;
        let y = (y1+y2)/2;

        x1 = x - x1;
        x2 = x - x2;
        y1 = y - y1;
        y2 = y - y2;

        let pts = [[x1,y1],[x2,y2]];
        

        let page = getObj('page',Campaign().get('playerpageid'));
        let newLine = createObj('pathv2',{
            layer: "foreground",
            pageid: page.id,
            shape: "pol",
            stroke: '#000000',
            stroke_width: 3,
            fill: '#000000',
            x: x,
            y: y,
            points: JSON.stringify(pts),
        });

        
    }

    const RemoveLines = () => {
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "foreground",});
        _.each(paths,path => {
            path.remove();
        })
    }

    const NextTurn = () => {
        let turn = state.Hardwar.turn;
        turn++;
        //reset unit activations, clear alert
        _.each(UnitArray,unit => {
            let actions = 2; // ? adjust
            unit.token.set({
                aura1_color: "#00FF00",
                bar1_value: actions,
            })
            unit.token.set(SM.alert,false);   
            unit.order = "";

        })
        //remove markers
        let rangedInMarkers = state.Hardwar.rangedIn;
        for (let i=0;i<2;i++) {
            let markers = rangedInMarkers[i];
            _.each(markers,markerID => {
                let unit = UnitArray[markerID];
                if (unit) {delete UnitArray[markerID]};
                let token = findObjs({_type:"graphic", id: markerID})[0];
                if (token) {token.remove()};
            })
        }
        state.Hardwar.rangedIn = [[],[]];
//remove smoke

        let unitNumbers = [0,0];
        _.each(UnitArray,unit => {
            if (unit.faction === state.Hardwar.factions[0]) {
                unitNumbers[0]++;
            } else if (unit.faction === state.Hardwar.factions[1]) {
                unitNumbers[1]++;
            }
        })
        SetupCard("Turn " + turn,"","Neutral");
        if (unitNumbers[0] < unitNumbers[1]) {
            outputCard.body.push(state.Hardwar.factions[0] + " has the Initiative");
        } else if (unitNumbers[1] < unitNumbers[0]) {
            outputCard.body.push(state.Hardwar.factions[1] + " has the Initiative");
        } else {
            outputCard.body.push("Roll for Initiative");
        }
        PrintCard();
        state.Hardwar.turn = turn;
    }






    const ClearState = (msg) => {
        //rebuild array of card IDs for each deck, will track which ones are played using this
        //DeckInfo is the master array of full deck

        LoadPage();
        BuildMap();


        state.Hardwar = {
            playerIDs: ["",""],
            players: {},
            factions: ["",""],
            lines: [],
            turn: 0,
            rangedIn: [[],[]],
        }





        sendChat("","Cleared State/Arrays");
    }

    const AddUnits = (msg) => {
        if (!msg.selected) {
            sendChat("","No Tokens Selected");
            return
        }
        _.each(msg.selected,element => {
            let id = element._id;
            let token = findObjs({_type:"graphic", id: id})[0];
            token.set({
                tooltip: "",
                aura1_color: "#00FF00",
                aura1_radius: 0.1,
                tint_color: "transparent",
                statusmarkers: "",
                gmnotes: "",
                rotation: 0,
            })

            let unit = new Unit(id);          
            if (state.Hardwar.factions[0] === "") {
                state.Hardwar.factions[0] = unit.faction;
            } else if (state.Hardwar.factions[0] !== unit.faction && state.Hardwar.factions[1] === "") {
                state.Hardwar.factions[1] = unit.faction;
            } 
            let player = (state.Hardwar.factions[0] == unit.faction) ? 0:1;
            
            unit.player = player;

            //reset stats
            unit.firepower = unit.firepowerMax;
            unit.mobility = unit.mobilityMax;
            unit.armour = unit.armourMax;
            unit.defence = unit.defenceMax;
            unit.damage = 12;
            AttributeSet(unit.charID,"firepower",unit.firepower);
            AttributeSet(unit.charID,"mobility",unit.mobility);
            let armID = AttributeSet(unit.charID,"armour",unit.armour);
            AttributeSet(unit.charID,"defence",unit.defence);
            let damID = AttributeSet(unit.charID,"damage",unit.damage);



            //set hp and activations
            token.set({
                bar1_value: 2,//mayneed to change based on units activations
                bar1_max: "",
                bar3_value: unit.armour,
                bar3_max: unit.armour,
                bar3_link: armID,
                bar2_value: unit.damage, 
                bar2_max: "",
                bar2_link: damID,
                bar_location: "overlap_bottom",

            })
        })


    }





    //line line collision where line1 is pt1 and 2, line2 is pt 3 and 4
    const lineLine = (pt1,pt2,pt3,pt4) => {
        //calculate the direction of the lines
        uA = ( ((pt4.x-pt3.x)*(pt1.y-pt3.y)) - ((pt4.y-pt3.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        uB = ( ((pt2.x-pt1.x)*(pt1.y-pt3.y)) - ((pt2.y-pt1.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            intersection = {
                x: (pt1.x + (uA * (pt2.x-pt1.x))),
                y: (pt1.y + (uA * (pt2.y-pt1.y)))
            }
            return intersection;
        }
        return;
    }
   


    const TargetAngle = (shooter,target) => {
        let shooterHex = HexMap[shooter.hexLabel];
        let targetHex = HexMap[target.hexLabel];

        //angle from shooter's hex to target's hex
        let phi = Angle(shooterHex.cube.angle(targetHex.cube));
        let theta = Angle(shooter.token.get("rotation"));
        let gamma = Angle(phi - theta);
        return gamma;
    }

    const CheckLOS = (msg) => {
        let Tag = msg.content.split(";");
        let shooterID = Tag[1];
        let targetID = Tag[2];
        let shooter = UnitArray[shooterID];
        if (!shooter) {
            sendChat("","Not valid shooter");
            return;
        }
        let target = UnitArray[targetID];
        if (!target) {
            sendChat("","Not valid target");
            return;
        }
        let distance;

        SetupCard(shooter.name,"LOS",shooter.faction);
        for (let i=0;i<shooter.weapons.length;i++) {
                outputCard.body.push("[hr]");
            let weapon = shooter.weapons[i];
            let losResult = LOS(shooter,target,weapon);
            distance = losResult.distance;
            outputCard.body.push("[U]" + weapon.name + "[/u]");
            if (losResult.los === false) {
                outputCard.body.push(losResult.losReason);
            } else if (losResult.los === true && losResult.lof === false) {
                outputCard.body.push("In LOS but Out of Arc of Fire");
            } else if (losResult.los === true && losResult.lof === true) {
                outputCard.body.push("In LOS and LOF");
                outputCard.body.push("Cover is " + losResult.cover);
            } 
            outputCard.body.push("[hr]");
        }
        outputCard.body.push("Distance is " + distance);
        outputCard.body.push("Target's Armour is " + target.armour);
        PrintCard();
    }


    const LOS = (shooter,target,weapon) => {
        if (!weapon) {
            weapon = {abilities: " "};
        }
        let los = true;
        let losReason = "";
        let losBlock = "";
        let lof = true;
        let water = "";
        let cover = 0;
        if (weapon.abilities.includes("Smart")) {
            cover = -2;
        }
        let shooterHex = HexMap[shooter.hexLabel];
        let targetHex = HexMap[target.hexLabel];
        let distance = shooterHex.cube.distance(targetHex.cube);
        let angle = TargetAngle(shooter,target);
        let spotterID = "";
        let aov = 180;

        let aof = 180;
        if (shooter.type === "Air") {
            aof = 90;
        }
        if (shooter.abilities.includes("Alert") || shooter.token.get(SM.alert) === true) {
            aov = 360;
        }


        if (angle > aov/2 && angle < (360-(aov/2))) {
            losReason = "Out of Arc of Vision";
            los = false;
        }
        if (angle > aof/2 && angle < (360-(aof/2))) {
            lof = false;
        }

        //check los now incl cover
        let sH = shooter.type === "Walker" ? shooter.class/2:shooter.class/5;
        let tH = target.type === "Walker" ? shooter.class/2:shooter.class/5;
        // ? crouching if used

        if (target.type === "Air") {
            //add height to distance unless weapon has AA



        }






        let pt1 = new Point(0,shooterHex.elevation + sH);
        let pt2 = new Point(distance,targetHex.elevation + tH);

        let interCubes = shooterHex.cube.linedraw(targetHex.cube);
        
        for (let i=1;i<interCubes.length;i++) {
            let label = interCubes[i].label();
            let interHex = HexMap[label];

            //check for hills
            let pt3 = new Point(i,0);
            let pt4 = new Point(i,interHex.elevation)
            let pt5 = lineLine(pt1,pt2,pt3,pt4);
//add in indirect here ?


            if (pt5) {
                los = false;
                losReason = "Blocked by Elevation at " + label;
                losBlock = label;
                break;
            }
            //check for terrain in hex
            pt3 = new Point(i,interHex.elevation);
            pt4 = new Point(i,interHex.elevation + interHex.terrainHeight);
            pt5 = lineLine(pt1,pt2,pt3,pt4);
            if (pt5) {
                if (interHex.traits.includes("Foliage")) {cover++};
                if (interHex.traits.includes("Smoke")) {cover += 2};
                if (interHex.traits.includes("Open Structure")) {cover += 3};
                if (interHex.traits.includes("Solid")) {
                    los = false;
                    losReason = "Blocked by Terrain at " + label;
                    losBlock = label;
                    break;
                }
                if (cover > 5 && losBlock === "") {
                    los = false;
                    losReason = "Blocked by Cover at " + label;
                    losBlock = label;
                    break;
                }

            }

            //check for terrain on hex side
            let delta = interCubes[i-1].subtract(interCubes[i]);
            let dir;
            for (let i=0;i<6;i++) {
                let d = HexInfo.directions[DIRECTIONS[i]];
                if (delta.q === d.q && delta.r === d.r) {
                    dir = DIRECTIONS[i];
                    break;
                }
            }            
            let edge = interHex.edges[dir];
            if (edge !== "Open") {
                let terrain = EdgeInfo[edge];
            log(terrain)
                pt3 = new Point(i,terrain.elevation);
                pt4 = new Point(i,terrain.elevation + terrain.terrainHeight);
                pt5 = lineLine(pt1,pt2,pt3,pt4);
                if (pt5) {
            log("Intersects")
                    if (terrain.traits.includes("Foliage") || terrain.traits.includes("Low Structure")) {
                        cover++;
                        if (cover > 5 && losBlock === "") {
                            los = false;
                            losReason = "Blocked by Cover at " + label;
                            losBlock = label;
                        }                        
                    }
                }
            }
        }


        //target hexside
        let delta = interCubes[interCubes.length -1].subtract(targetHex.cube);
        let dir;
        for (let i=0;i<6;i++) {
            let d = HexInfo.directions[DIRECTIONS[i]];
            if (delta.q === d.q && delta.r === d.r) {
                dir = DIRECTIONS[i];
                break;
            }
        }     
        let edge = targetHex.edges[dir];
        if (edge !== "Open") {
            let terrain = EdgeInfo[edge];
            if (terrain.traits.includes("Foliage") || terrain.traits.includes("Low Structure")) {
                cover++;
                if (cover > 5 && losBlock === "") {
                    los = false;
                    losReason = "Blocked by Cover at " + targetHex.label + " Edge";
                    losBlock = label;
                }
            }
        }

        //target hex
        if (targetHex.traits.includes("Foliage")) {cover++};
        if (targetHex.traits.includes("Smoke")) {cover += 2};
        if (targetHex.traits.includes("Open Structure") || targetHex.traits.includes("Solid")) {cover += 3};

        if (targetHex.traits.includes("Water")) {
            //partially submerged or fully submerged
            //partially = +1 cover 
            //fully = +2 cover / depth - only for submersible units
            //water will also have a depth, most units can't go in unless depth is 0
            //pass back something also for things like exploding dice, flamethrowers, laser etc which have different effects


        }
        if (target.token.get(SM.digin) === true) {
            cover += 3;
        }

        if (cover > 5 && losBlock === "") {
            los = false;
            losReason = "Blocked by Cover"
            losBlock = targetHex.label;
        }

        cover = Math.max(0,cover);

        //indirect or guided weapons check
        let indirect = false;
        if (los === false && (weapon.abilities.includes("Indirect") || weapon.abilities.includes("Guided"))) {
            //check for spotter
            _.each(UnitArray,spotter => {
                if (spotter.faction === shooter.faction) {
                    if (spotter.token.get(SM.spotting) === true) {
                        let spotterLOS = LOS(spotter,target);
                        if (spotterLOS.los === true) {
                            los = true;
                            indirect = "Spotter"
                            spotterID = spotter.id;
                            if (weapon.abilities.includes("Guided")) {
                                distance = spotterLOS.distance;
                                cover = spotterLOS.cover;
                            }
                        }
                    }
                }
            })
            //check for markers
            if (los === false && weapon.abilities.includes("Indirect")) {
                los = true;
                indirect = "No LOS";
                _.each(state.Hardwar.rangedIn[shooter.player],markerID => {
                    let marker = UnitArray[markerID];
                    let d = HexMap[marker.hexLabel].cube.distance(targetHex.cube);
                    if (d < 2) {
                        indirect = "Marker";
                    }
                })
            }
        }

        let result = {
            los: los,
            losReason: losReason,
            losBlock: losBlock,
            lof: lof,
            distance: distance,
            angle: angle,
            cover: cover,
            water: water,
            indirect: indirect,
            spotterID: spotterID,
        }
        return result;
    }


    const Activate = (msg) => {
        let id = msg.selected[0]._id;
        if (!id) {return};
        let order = msg.content.split(";")[1];
        let unit = UnitArray[id];
        SetupCard(unit.name,order,unit.faction);
        let errorMsg = [];
        let actions = parseInt(unit.token.get("bar1_value"));
        if (actions === 0) {
            errorMsg.push("Unit has no further actions left");
        }
        if (actions === 1 && order === "Aimed Shot") {
            errorMsg.push("Unit needs 2 orders to take an Aimed Shot");
        }


        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                outputCard.body.push(msg);
            })
            PrintCard();
            return;
        }

        currentUnitID = id;
        unit.order = order;
        let mobility = unit.mobility;
        unit.startHexLabel = unit.hexLabel; //track distance

        actions--;
        if (order === "Advance") {
            outputCard.body.push("The Unit may Move and Fire in either Order.");
            outputCard.body.push("The Target must be in LOS from the starting position");
            outputCard.body.push("Cautious Move: " + mobility + " MP, gaining Alert");
            outputCard.body.push("Patrol Move: " + (mobility * 2) + " MP");
        }
        if (order === "Rapid Move") {
            outputCard.body.push("The Unit may Rapid Move but not Fire");
            outputCard.body.push((mobility * 3) + " MP, only one turn at beginning or end of movement");
        }
        if (order === "Stand and Fire") {
            outputCard.body.push("The Unit Stands and Fires");
        } 
        if (order === "Aimed Shot") {
            outputCard.body.push("The Unit takes one action to aim and a 2nd to Fire. Other Units may React before it fires");
            actions--;
        }
        if (order === "Guard") {
            outputCard.body.push("The Unit goes on Guard and ends its Turn");
            actions = 0;
            unit.token.set("aura1_color","#800080");
        }
        if (order === "Charge") {
            outputCard.body.push("The Unit may charge an enemy Unit");
            outputCard.body.push("The Unit may turn at the beginning of its turn, then must charge in a straight line at the target");
            outputCard.body.push("Cautious Move: " + mobility + " MP, gaining Alert");
            outputCard.body.push("Patrol Move: " + (mobility * 2) + " MP");
            outputCard.body.push("Rapid Move: " + (mobility * 3) + " MP");
        }
        if (order === "Mark Coordinates") {
            outputCard.body.push("Place the Target Icon on a Hex, then activate it");
            outputCard.body.push("That Hex will be marked until the end of the turn");
            let msg = unit.id + ";" + "Relay"
            PlaceTarget(msg);
        }

        actions = Math.max(0,actions);
        if (actions === 0 && order !== "Guard") {
            unit.token.set("aura1_color","#000000");
        }
        unit.token.set("bar1_value",actions);
        PrintCard();
    }

    const Fire = (msg) => {
        let Tag = msg.content.split(";");
        let attackerID = Tag[1];
        let attacker = UnitArray[attackerID];
        let defenderID = Tag[2];
        let defender = UnitArray[defenderID];
        let weaponNum = Tag[3];
        let weapon = attacker.weapons[weaponNum];
        let order = attacker.order;

        let losResult = LOS(attacker,defender,weapon);
        let firepower = attacker.firepower;
        let fpTip = "FP: " + firepower;
        if (order === "Advance" && attacker.abilities.includes("Bracing Mass") === false) {
            firepower = Math.round(firepower/2);
            fpTip += "<br>Advance = 1/2 FP";
        } else if (order === "Aimed Shot") {
            firepower++;
            fpTip += "<br>Aimed Shot";
        }

        let defence = defender.defence;
        let dTip = "Defence: " + defence;
        if (weapon.abilities.includes("XMG")) {
            defence--;
            dTip += "<br>XMG -1 D";
        }




        SetupCard(attacker.name,weapon.name,attacker.faction);
        let errorMsg = [];

        if (order === "Rapid Move" || order === "Charge") {
            errorMsg.push("Cannot Fire while on " + order);
        }

        if (losResult.los === false && losResult.indirect === false) {
            errorMsg.push("No LOS To Target");
            errorMsg.push(losResult.losReason);
        }
        if (losResult.los === true && losResult.lof === false) {
            errorMsg.push("In LOS but Out of Arc of Fire");
        }

        if (losResult.indirect !== false) {
            if (weapon.abilities.includes("Indirect")) {
                if (losResult.indirect === "No LOS") {
                    firepower = Math.round(firepower/2);
                    fpTip += "<br>1/2 FP - No LOS/Indirect";
                } else if (losResult.indirect === "Spotter") {
                    fpTip += "<br>Full FP - Spotter/Indirect";
                } else if (losResult.indirect === "Marker") {
                    firepower--;
                    fpTip += "<br>-1 FP, Marker/Indirect"
                }
            }
            if (weapon.abilities.includes("Spotter")) {
                fpTip += "<br>Guided - Distance and Cover from Spotter";
            }
        }

        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                outputCard.body.push(msg);
            })
            PrintCard();
            return;
        }
        
        let distance = losResult.distance;
        //AA and Aircraft here

        let cover = losResult.cover; //smart is factored in LOS function already
        let armour = defender.armour;
        let nTip = "Distance: " + distance + "<br>Cover: " + cover + "<br>Armour: " + armour;

        if (weapon.abilities.includes("Gatling")) {
            armour = Math.max(0,armour - 2);
            nTip += "<br>Gatling: -2 Armour";
        }

        let needed = distance + cover + armour;



        fpTip = '[⚔️](#" class="showtip" title="' + fpTip + ')';
        nTip = '[◎](#" class="showtip" title="' + nTip + ')';
        dTip = '[🛡️](#" class="showtip" title="' + dTip + ')';

        outputCard.body.push(fpTip + " Firepower: " + firepower + " Dice");
        outputCard.body.push(nTip + " Target: " + needed + "+");
        outputCard.body.push(dTip + " Defence: " + defence + " Dice");
        outputCard.body.push("[hr]");

        combatArray = {
            attacker: attacker,
            defender: defender,
            weapon: weapon,
            firepower: firepower,
            defence: defence,
            needed: needed,
            totalHits: 0,
            ranged: true,
            results: {},
            statsFlag: false,
        };




        CombatRolls();
        RangedOutput();
        if (currentUnitID === attacker.id) {
            defender.Damage();
        }
        PrintCard();

        //fx
        FX(weapon.fx,attacker,defender);
        //sound
        PlaySound(weapon.sound);

        if (losResult.indirect === "Spotter") {
            let spotter = UnitArray[losResult.spotterID];
            spotter.token.set(SM.spotting,false);
        }


    }

    const CombatRolls = () => {

        let attacker = combatArray.attacker;
        let defender = combatArray.defender;
        let weapon = combatArray.weapon;
        let fp = combatArray.firepower;
        let defence = combatArray.defence;
        let target = combatArray.needed;
        let rangedFlag = combatArray.ranged;

        let aTip = "";
        let dTip = "";
        let roll;
        let attackRolls = [];
        let defenceRolls = [];

        for (let i=0;i<fp;i++) {
            roll = randomInteger(12);
            attackRolls.push(roll);
        }
        for (let i=0;i<defence;i++) {
            roll = randomInteger(12);
            defenceRolls.push(roll);
        }
        attackRolls.sort();
        defenceRolls.sort();

        if (weapon.abilities.includes("Dual")) {
            if (attackRolls[0] < 7) {
                aTip += "<br>Dual: " + attackRolls[0];
                attackRolls[0] = randomInteger(12);
                aTip += "->" + attackRolls[0];
                attackRolls.sort();
            }
        }
        if (defender.abilities.includes("Point Defence") && rangedFlag === true) {
            for (let i=0;i<defenceRolls.length;i++) {
                let test = defenceRolls[i];
                if (attackRolls.includes(test) === false) {
                    dTip += "<br>Point Defence: " + test;
                    defenceRolls[i] = randomInteger(12);
                    dTip += "->" + defenceRolls[i];
                    defenceRolls.sort();
                    break;
                }
            }
        }
        if (attacker.abilities.includes("Assisted Targetting") && rangedFlag === true) {
            for (let i=0;i<attackRolls.length;i++) {
                let test = attackRolls[i];
                if (defenceRolls.includes(test) === true) {
                    aTip += "<br>Assisted Targetting: " + test;
                    attackRolls[i] = randomInteger(12);
                    aTip += "->" + attackRolls[i];
                    attackRolls.sort();
                    break;
                }
            }
        }

        let originalAttackRolls = DeepCopy(attackRolls).sort((a,b) => b-a); //used for output
        let originalDefenceRolls = DeepCopy(defenceRolls).sort((a,b) => b-a); //used for output
        let explodingAttackRolls = []; //output
        let explodingDefenceRolls = []; //output
        let cancelledRolls = []; //used for output



        //cancel out any augments before exploding - only done on initial rolls
        let a12count = attackRolls.filter(num => num === 12).length;
        let d12count = defenceRolls.filter(num => num === 12).length;
        let a11count = 0;
        let d11count = 0;
        let min = Math.min(a12count,d12count);
        for (let i=0;i<min;i++) {
            cancelledRolls.push(12);
            let pos = attackRolls.indexOf(12);
            if (pos > -1) {
                attackRolls.splice(pos,1);
            }
            pos = defenceRolls.indexOf(12);
            if (pos > -1) {
                defenceRolls.splice(pos,1);
            }
        }
        a12count -= min;
        d12count -= min;
        
        if (weapon.abilities.includes("Laser")) {
            aTip += "<br>Laser: Augments on 11 or 12";
            a11count = attackRolls.filter(num => num === 11).length;
            d11count = defenceRolls.filter(num => num === 11).length
            min = Math.min(a11count,d11count);
            for (let i=0;i<min;i++) {
                cancelledRolls.push(11)
                let pos = attackRolls.indexOf(11);
                if (pos > -1) {
                    attackRolls.splice(pos,1);
                }
                pos = defenceRolls.indexOf(11);
                if (pos > -1) {
                    defenceRolls.splice(pos,1);
                }
            }
            a11count -= min;
            d11count -= min;
        }

        let attAugment = a12count + a11count;
        let defAugment = d12count; //defence only explodes on 12

        //explode any augment dice, and cancel out any matching for defence
        for (let i=0;i<attAugment;i++) {
            do {
                roll = randomInteger(12);
                attackRolls.push(roll);
                explodingAttackRolls.push(roll);
            }
            while (roll === 12);
        }
        for (let i=0;i<defAugment;i++) {
            do {
                roll = randomInteger(12);
                defenceRolls.push(roll);
                explodingDefenceRolls.push(roll);
            }
            while (roll === 12);
        }
        attackRolls.sort();
        defenceRolls.sort();
        explodingAttackRolls.sort((a,b) => b-a);
        explodingDefenceRolls.sort((a,b) => b-a);

        //cancel out rolls now
        _.each(defenceRolls,roll => {
            let pos = attackRolls.indexOf(roll);
            if (pos > -1) {
                attackRolls.splice(pos,1);
                cancelledRolls.push(roll)
            }
        })

        let groups = [];
        let unassignedRolls = [];
        attackRolls.sort((a,b) => b - a); //sort highest to lowest for this
        cancelledRolls.sort();

        let finalAttackRolls = DeepCopy(attackRolls); //display again
        if (attackRolls.length > 0) {
            //assign criticals to their own groups initially
            do {
                roll = attackRolls.shift();
                if (roll) {
                    let nextRoll = attackRolls[0];
                    if (nextRoll && roll === nextRoll) {
                        roll = attackRolls.shift();
                        let info = {
                            sum: roll * 2,
                            critical: true,
                            needed: Math.max(0,target - (roll * 2)),
                            rolls: [roll,roll],
                        }
                        groups.push(info);
                    } else {
                        unassignedRolls.push(roll);
                    }
                }
            } while (attackRolls.length > 0);
            groups.sort((a,b) => a.needed - b.needed);
            unassignedRolls.sort((a,b) => a - b);

            //fill with unassigned, searching for best # (exact or higher) or using lowest and re-searching
            for (let i=0;i<groups.length;i++) {
                let group = groups[i];
                if (group.needed > 0 && unassignedRolls.length > 0) {
                    do {
                        let pos = 0;
                        //defaults to lowest roll unless finds exact match or higher in unassigned rolls
                        for (let p=0;p<unassignedRolls.length;p++) {
                            if (unassignedRolls[p] >= group.needed) {
                                pos = p;
                                break;
                            } 
                        }
                        roll = parseInt(unassignedRolls.splice(pos,1));
                        group.rolls.push(roll);
                        group.sum += roll;
                        group.needed = Math.max(0,target - group.sum);
                    } while (group.needed > 0 && unassignedRolls.length > 0);
                }
            }

            //critical groups now filled or no more unassignedRolls
            //if further unassignedRolls, assign these to groups
            //start with highest # as a group, searching for best # (exact or higher) or using lowest and re-searching
            if (unassignedRolls.length > 0) {
                do {
                    roll = parseInt(unassignedRolls.pop());
                    let info = {
                        sum: roll,
                        needed: Math.max(0,target - roll),
                        rolls: [roll],
                        critical: false,
                    }
                    if (info.needed > 0 && unassignedRolls.length > 0) {
                        do {
                            let pos = 0;
                            //defaults to lowest roll unless finds exact match or higher in unassigned rolls
                            for (let p=0;p<unassignedRolls.length;p++) {
                                if (unassignedRolls[p] >= info.needed) {
                                    pos = p;
                                    break;
                                } 
                            }
                            roll = parseInt(unassignedRolls.splice(pos,1));
                            info.rolls.push(roll);
                            info.sum += roll;
                            info.needed = Math.max(0,target - info.sum);
                        } while (info.needed > 0 && unassignedRolls.length > 0);
                    }
                    groups.push(info);
                } while (unassignedRolls.length > 0);
            }

        }


        let tip = "Attack Rolls<br>" + originalAttackRolls.toString();
        if (explodingAttackRolls.length > 0) {
            tip += " + " + explodingAttackRolls.toString();
        }
        tip += aTip;
        tip += "<br>--------------------------";
        tip += "<br>Defence Rolls<br>" + originalDefenceRolls.toString();
        if (explodingDefenceRolls.length > 0) {
            tip += " + " + explodingDefenceRolls.toString();
        }
        tip += dTip;
        if (cancelledRolls.length > 0) {
            tip += "<br>--------------------------";
            tip += "<br>Cancelled Rolls: " + cancelledRolls.toString();
        }
        if (finalAttackRolls.length > 0) {
            tip += "<br>--------------------------";
            tip += "<br>Final Attack Rolls: " + finalAttackRolls.toString();
        }
        tip = '[🎲](#" class="showtip" title="' + tip + ')';


        let noncriticals = [];
        let criticals = [];
        let railgunUsed = false;

        _.each(groups,group => {
            let rolls = "[" + group.rolls.sort((a,b) => b-a).toString() + "]";
            if (group.needed === 0) {
                if (group.critical === true) {
                    criticals.push(rolls);
                    StatDamage(defender,true); //place damage in combat array
                } else {
                    if (weapon.abilities.includes("Railgun") && railgunUsed === false) {
                        criticals.push("Railgun - " + rolls);
                        railgunUsed = true;
                        StatDamage(defender,true);
                    } else {
                        noncriticals.push(rolls);
                        StatDamage(defender,false);
                    }
                }
            }
        })

        let totalHits = noncriticals.length + criticals.length;

        if (weapon.abilities.includes("Plasma Accelerator") && noncriticals.length > 0) {
            noncriticals.push("Plasma Accelerator - +1 Hit");
            totalHits++
            StatDamage(defender,false);
        }

        if (weapon.abilities.includes("Sonic Cannon") && totalHits > 0) {
            let rolls = "[" + groups[0].rolls.sort((a,b) => b-a).toString() + "]";
            noncriticals = ["Sonic - 1 Hit does 3 Damage " + rolls];
            criticals = [];
            StatDamage(defender,"Sonic");
            totalHits = 3;
        }
        if (weapon.abilities.includes("EMP") && totalHits > 0) {
            totalHits = 1;
        }






        combatArray.results = {
            hitTip: tip,
            cancelledRolls: cancelledRolls.length,
            criticals: criticals,
            noncriticals: noncriticals,
            totalHits: totalHits,
            finalAttackRolls: finalAttackRolls.length,
        }
    }

    const RangedOutput = () => {
        let results = combatArray.results;
        let noncriticals = combatArray.noncriticals;
        let criticals = combatArray.criticals;
        let cancelledRolls = combatArray.cancelledRolls;
        let finalAttackRolls = combatArray.finalAttackRolls;
        let totalHits = combatArray.totalHits;
        let weapon = combatArray.weapon;
        let s;

        outputCard.body.push("[U]" + results.hitTip + " Results[/u]");
        if (totalHits > 0) {
            if (cancelledRolls > 0) {
                s = (cancelledRolls === 1) ? "":"s";
                outputCard.body.push("Active Defences Defeated " + cancelledRolls + " Attack" + s)
            }
            if (weapon.abilities.includes("EMP")) {
                outputCard.body.push("No Damage is Done");
                outputCard.body.push("But the Target loses all Actions");
                outputCard.body.push("And any ongoing abilities such as Guard or Spotting");
                combatArray.statDamage = {mobility: 0,firepower: 0,armour: 0, defence: 0, emp: 1};
            } else if (weapon.abilities.includes("Sonic Cannon")) {
                let cTip = '[🎲](#" class="showtip" title="' + criticals.toString() + ')';
                cTip += '[🎲](#" class="showtip" title="' + noncriticals.toString() + ')';
                outputCard.body.push(cTip + " Sonic Cannon Hit");
            } else {
                if (criticals.length > 0) {
                    s = (criticals.length > 1) ? "s":"";
                    let cTip = '[🎲](#" class="showtip" title="' + criticals.toString() + ')';
                    outputCard.body.push(cTip + " " + criticals.length + " Critical Hit" + s);
                }
                if (noncriticals.length > 0) {
                    s = (noncriticals.length > 1) ? "s":"";
                    let cTip = '[🎲](#" class="showtip" title="' + noncriticals.toString() + ')';
                    outputCard.body.push(cTip + " " + noncriticals.length + " Hit" + s);
                }
                outputCard.body.push("Total: " + totalHits + " Hull Damage");
            }
            if (combatArray.statFlag === true) {
                outputCard.body.push("[hr]");
                outputCard.body.push("[U]Stat Damage[/u]");
                let keys = Object.keys(combatArray.statDamage);
                _.each(keys,key => {
                    let damage = combatArray.statDamage[key];
                    if (damage > 0) {
                        let name = key.charAt(0).toUpperCase() + key.slice(1);
                        outputCard.body.push(name + ": " + damage);
                    }
                })
            }


        } else {
                if (finalAttackRolls === 0) {
                    outputCard.body.push("All Attacks Defeated by Active Defences");
                } else {
                    if (cancelledRolls > 0) {
                        s = (cancelledRolls.length === 1) ? "":"s";
                        outputCard.body.push("Active Defences Defeated " + cancelledRolls + " Attack" + s)
                        outputCard.body.push("The Remainder Missed");
                    } else {
                        outputCard.body.push("All Attacks Missed");
                    }
                }
        }
    }





    const SumArray = (array) => {
        //sum an array of numbers
        let sum = 0;
        _.each(array,element => {
            sum += element;
        })
        return sum;
    }

    const StatDamage = (defender,critical) => {
        let highestStat;
        let lowestStat;
        let highest = 0
        let lowest = Infinity
        let names = ["armour","defence","mobility","firepower"];
        _.each(names,name => {
            if (defender[name] > highest) {
                highest = defender[name];
                highestStat = name;
            }
            if (defender[name] < lowest) {
                lowest = defender[name];
                lowestStat = name;
            }
        })        
        let statDamage = combatArray.statDamage || {mobility: 0,firepower: 0,armour: 0, defence: 0};
        if (critical === true) {
            statDamage[lowestStat]++;
        } else {
            statDamage[highestStat]++;
        }
        combatArray.statDamage = statDamage;
        combatArray.statFlag = true;
    }






    const changeGraphic = (obj,prev) => {
        RemoveLines();

        let id = obj.get("id");
        let unit = UnitArray[id];

        if (unit) {
            let location = new Point(obj.get("left"),obj.get("top"));
            let newHexLabel = location.toCube().label();
            if (newHexLabel !== unit.hexLabel) {
                let index = HexMap[unit.hexLabel].tokenIDs.indexOf(id);
                if (index > -1) {
                    HexMap[unit.hexLabel].tokenIDs.splice(index,1);
                }
                HexMap[newHexLabel].tokenIDs.push(id);
                unit.hexLabel = newHexLabel;
            }
        }



        //fix the token size in case accidentally changed while game running - need check that game is running
        if (state.Hardwar.turn === 0) {return};
        let name = obj.get("name");
        if (obj.get("width") !== prev.width || obj.get("height") !== prev.height) {
            obj.set({
                width: prev.width,
                height: prev.height,
            })
        }

        //MOvement routine







    }

    const addGraphic = (obj) => {
        log(obj)
        RemoveLines();




    }
    
    const destroyGraphic = (obj) => {
        let name = obj.get("name");
        log(name + " Destroyed")
        if (UnitArray[obj.get("id")]) {
            delete UnitArray[obj.get("id")];
        }


    }






    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
    
        switch(args[0]) {
            case '!Dump':
                log("State");
                log(state.Hardwar);
                log("Units");
                log(UnitArray)
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!EndRound':
                EndRound(msg);
                break;
            case '!AddAbilities':
                AddAbilities(msg);
                break;
            case '!AddMarker':
                AddMarker(msg);
                break;
            case '!HexData':
                HexData(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
                break;
            case '!RemoveLines':
                RemoveLines();
                break;
            case '!AddUnits':
                AddUnits(msg);
                break;
            case '!NextTurn':
                NextTurn();
                break;
            case '!Activate':
                Activate(msg);
                break;
            case '!Fire':
                Fire(msg);
                break;
            case '!Test':
                AttackDice();
                break;
            case '!Mark':
                Mark(msg);
                break;

        }
    };




    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on("add:graphic", addGraphic);
        on('change:graphic',changeGraphic);
        on('destroy:graphic',destroyGraphic);
    };
    on('ready', () => {
        log("===> Hardwar <===");
        log("===> Software Version: " + version + " <===")
        LoadPage();
        PlayerIDs();
        DefineHexInfo();
        BuildMap();
        registerEventHandlers();
        sendChat("","API Ready")
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();
