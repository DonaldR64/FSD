const FSD = (() => {
    const version = '2025.8.11';
    if (!state.FSD) {state.FSD = {}};

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
    let currentUnitID = "";
    let FireInfo = {};
    let AbilityInfo = {};
    const MapAreas = {};



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
        "Tech": {
            "image": "",
            "backgroundColour": "orange",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#ffA500",
            "borderStyle": "5px groove",
        },
        "Conglomerate": {
            "image": "",
            "backgroundColour": "#0000ff",
            "titlefont": "Bokor",
            "fontColour": "#ffffff",
            "borderColour": "#0000ff",
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


//change - consider up arrow and down arrow for flyers, side arrows for moved, ammo for fired etc
    const SM = {
        noe: "status_blue", //nap of earth for flyer
        flying: "status_green", //higher elevation for flyer
        moved: "status_brown",
    }





    //height is height of terrain element
    //elevation is 0 by default


    const TerrainInfo = {
        "Woods": {name: "Woods",height: 2,los: "Blocking", move: "Broken"},
        "Scrub": {name: "Scrub",height: 1, los: "Obscuring", move: "Fragile"},
        "Crops": {name: "Crops",height: 0.25, los: "Obscuring",move: "Open"},

        "Building 1": {name: "Building", height: 1, los: "Blocking",move: "Traversable"},

        "Rubble": {name: "Rubble",height: 0.25, los: "Obscuring",move: "Broken"},

        "Ruins": {name: "Ruins",height: 1, los: "Obscuring",move: "Traversable"},

        "Water": {name: "Water",height: 0,los: "Open",move: "Water" },

        "Hill 1": {name: "Hill 1",height: 0,elevation:1},
        "Hill 2": {name: "Hill 2",height: 0, elevation:2},
        "Hill 3": {name: "Hill 3",height: 0, elevation:3},

    }

    const EdgeInfo = {
        "#00ff00": {name: "Hedge",height: 0.25, los: "Obscuring", move: "Fragile"},
        "#980000": {name: "Wall",height: 0.25, los: "Obscuring",move: "Broken"},
        "#0000ff": {name: "Stream",height: 0,los: "Open",move: "Broken"},
        "#000000": {name: "Bridge",height: 0.25,los: "Obscuring",move: "Open"},
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

            this.los = "Open";
            this.move = "Open";
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
            let label = (new Point(token.get("left"),token.get("top"))).label();
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
            this.player = (this.faction === "Neutral") ? 2:(state.FSD.factions[0] === this.faction)? 0:1;
            this.special = aa.special || " ";
            this.points = parseInt(aa.points) || 0;

            this.type = aa.type;
            let height = 0; //units own height
            if (this.type === "Walker") {
                height = 1;
            }
            if (this.type === "Vehicle") {
                height = .5;
            }
            if (this.type === "Behemoth") {
                height = 2;
            }

            this.height = height;

            this.command = parseInt(aa.command) || 0;
            this.defense = parseInt(aa.defense) || 1;
            let saveInfo = aa.save || 0; // eg d10(3)
            saveInfo = saveInfo.split("(");
            let dX = parseInt(saveInfo[0].replace("d",""));
            let numberDice = saveInfo[1] || 1;
            numberDice = parseInt(numberDice);
            let save = {
                number: numberDice,
                dX: dX,
            }
            this.save = save;
            this.move = parseInt(aa.move);
            this.moveMax = parseInt(aa.move_max);
            this.saveMax = aa.save_max; //save in original format for ease of updating attribute


            let systemNumbers = {};

            let weapons = [];
            for (let i=0;i<5;i++) {
                let w=i+1;
                let prefix = "weapon" + w;
                let wname = aa[prefix + "name"];
                let wequip = aa[prefix + "equipped"];
                if (!wequip || wequip === undefined || wequip === "Off") {continue};
                if (!wname || wname === undefined || wname === null) {continue};
                let sn = aa[prefix + "systemnum"];
                systemNumbers[sn] = prefix;
                let wready = aa[prefix + "ready"] || "🔴";
                let wad = aa[prefix + "ad"] || "Free";
                let wspecial = aa[prefix + 'special'] || " ";

                let weapon = {
                    name: wname,
                    ad: wad,
                    ready: wready,
                    sn: sn,
                    range: aa[prefix + "range"],
                    damage: aa[prefix + "damage"],
                    special: wspecial,
                    fx: aa[prefix + "fx"],
                    sound: aa[prefix + "sound"],
                }
                weapons.push(weapon);
            }
            this.weapons = weapons;

            let abilities = [];
            for (let i=0;i<5;i++) {
                let w=i+1;
                let prefix = "ability" + w;
                let aname = aa[prefix + "name"];
                let aequip = aa[prefix + "equipped"];
                if (!aequip || aequip === undefined || aequip === "Off") {continue};
                if (!aname || aname === undefined || aname === null) {continue};
                let sn = aa[prefix + "systemnum"];
                systemNumbers[sn] = prefix;
                let aready = aa[prefix + "ready"] || "🔴";
                let aad = aa[prefix + "ad"] || "Free";
                let aspecial = aa[prefix + 'special'] || " ";

                let ability = {
                    name: aname,
                    ad: aad,
                    ready: aready,
                    sn: sn,
                    special: aspecial,
                    fx: aa[prefix + "fx"],
                    sound: aa[prefix + "sound"],
                }
                abilities.push(ability);
            }
            this.abilities = abilities;

            let drt = {};
            let systems = {};
            for (let i=1;i<7;i++) {
                let rolls = aa["roll" + i];
                if (!rolls || rolls === null) {continue};
                rolls = rolls.split(",");
                _.each(rolls, roll => {
                    roll = parseInt(roll);
                    let system = aa["damage" + i];
                    system = system.replace("System ","");
                    let status = aa["damage" + i + "status"];
                    drt[roll] = {
                        system: system,
                    }
                    if (!systems[system]) {
                        systems[system] = {
                            system: systemNumbers[system],
                            status: status,
                        }
                    }
                })
            }

            this.damageTable = drt;
            this.systemTable = systems;
            this.groupIDs = "";
            let gmnotes = decodeURIComponent(token.get("gmnotes")).toString();
            if (gmnotes && gmnotes !== null && gmnotes !== "") {
                this.groupIDs = gmnotes;
            }


this.offMap = false;   ///


            UnitArray[id] = this;
            HexMap[label].tokenIDs.push(id);






        }


        Damage () {
            



        }


        Destroyed () {
            

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
        AddAreas();
        AddTokens();        
        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };

    const AddAreas = () => {
        //define areas with lines
        if (state.FSD.factions[0] === "" || state.FSD.factions[1] === "") {return};
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "foreground",});
        _.each(paths,path => {
            if (path.get("stroke").toLowerCase() === "#ff0000") {
                let vertices = translatePoly(path);
                MapAreas[state.FSD.factions[0]] = {'vertices': vertices};
            } else if (path.get("stroke").toLowerCase() === "#000000") {
                let vertices = translatePoly(path);
                MapAreas[state.FSD.factions[1]] = {'vertices': vertices};
            }
        });
    }






    const AddEdges = () => {

 //add other types from edgeinfo

        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});
        _.each(paths,path => {
            let type = EdgeInfo[path.get("stroke").toLowerCase()];
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
                            //dont overwrite bridges
                            if (hex1.edges[DIRECTIONS[j]].name !== "Bridge") {
                                hex1.edges[DIRECTIONS[j]] = type;
                            }
                            if (hex2.edges[DIRECTIONS[k]].name !== "Bridge") {
                                hex2.edges[DIRECTIONS[k]] = type;
                            }
                        }
                    }
                }
            }
        })
    }


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
                    hex.los = "";
                    hex.move = "";
                }
                if (hex.terrain.includes(terrain.name) === false) {
                    hex.terrain.push(terrain.name);
                    hex.elevation = Math.max(hex.elevation,terrain.elevation);
                    hex.terrainHeight = Math.max(terrain.height, hex.terrainHeight);
                    hex.los = terrain.los;
                    hex.move = terrain.move;
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
        let side = state.FSD.players[playerID];

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


    const TokenInfo = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return};
        SetupCard(unit.name,"",unit.faction);
        let hex = HexMap[unit.hexLabel];
        outputCard.body.push("Hex: " + unit.hexLabel);
        outputCard.body.push("Terrain: " + hex.terrain);
        outputCard.body.push("Elevation: " + hex.elevation);
        outputCard.body.push("Height of Terrain: " + hex.terrainHeight);
        outputCard.body.push("LOS: " + hex.los);
        outputCard.body.push("Movement: " + hex.move);
        for (let i=0;i<6;i++) {
            let edge = hex.edges[DIRECTIONS[i]];
            if (edge !== "Open") {
                outputCard.body.push(edge.name + " on " + DIRECTIONS[i] + " Edge");
            }
        }
        if (hex.los.includes("Obscuring") || hex.los.includes("Blocking")) {
            outputCard.body.push("Unit is in Cover");
        }
        if (unit.groupIDs) {
            outputCard.body.push("Unit is part of Group");
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
        let turn = state.FSD.turn;
        turn++;
        state.FSD.turn = turn;
        //get highest command and any resets on units
//???? Characters pick out also

        let commandBonus = [0,0]
        _.each(UnitArray,unit => {
            if (unit.token.get("tint_color") !== "#ff0000" && unit.offMap === false) {
                commandBonus[unit.player] = Math.max(commandBonus[unit.player],unit.command);
            }
            unit.moved = false;


        })

//any end turn things here

        //move spent dice to roll pile




        SetupCard("Turn " + turn,"","Neutral");
        outputCard.body.push("Bring in any Reinforcements");
        outputCard.body.push("[hr]");
        outputCard.body.push("Roll For Initiative");
        outputCard.body.push(state.FSD.factions[0] + " adds " + commandBonus[0]);
        outputCard.body.push(state.FSD.factions[1] + " adds " + commandBonus[1]);
        outputCard.body.push("[hr]");
        outputCard.body.push("Starting with the lower result, both players roll their Activation Dice");
//? roll and place then just prompt for reroll and pre-assign
        outputCard.body.push("And Pre-Assign any Dice");
        outputCard.body.push("[hr]");
        outputCard.body.push("Then the winner of the Initiative can pick who activates First");
        PrintCard();

    }

    const RollD6 = (msg) => {
        let Tag = msg.content.split(";");
        PlaySound("Dice");
        let roll = randomInteger(6);
        let playerID = msg.playerid;
        let faction = "Neutral";
        if (!state.FSD.players[playerID] || state.FSD.players[playerID] === undefined) {
            if (msg.selected) {
                let id = msg.selected[0]._id;
                if (id) {
                    let tok = findObjs({_type:"graphic", id: id})[0];
                    let char = getObj("character", tok.get("represents")); 
                    faction = Attribute(char,"faction");
                    state.FSD.players[playerID] = faction;
                }
            } else {
                sendChat("","Click on one of your tokens then select Roll again");
                return;
            }
        } else {
            faction = state.FSD.players[playerID];
        }
        let res = "/direct " + DisplayDice(roll,faction,40);
        sendChat("player|" + playerID,res);
    }






    const ClearState = (msg) => {
        LoadPage();
        BuildMap();


        state.FSD = {
            playerIDs: ["",""],
            players: {},
            factions: ["",""],
            lines: [],
            turn: 0,
        }





        sendChat("","Cleared State/Arrays");
    }

    const AddUnits = (msg) => {
        if (!msg.selected) {
            sendChat("","No Tokens Selected");
            return
        }

        let group = msg.content.split(";")[1];
        group = (group === "Yes") ? true:false;
        let tokenIDs = [];

        _.each(msg.selected,element => {
            let id = element._id;
            let token = findObjs({_type:"graphic", id: id})[0];
            token.set({
                bar1_value: 2,
                aura1_color: "#00FF00",
                aura1_radius: 0.05,
                tint_color: "transparent",
                statusmarkers: "",
                gmnotes: "",
                rotation: 0,
                disableSnapping: true,
                disableTokenMenu: false,
            })

            let unit = new Unit(id);          
            if (state.FSD.factions[0] === "") {
                state.FSD.factions[0] = unit.faction;
            } else if (state.FSD.factions[0] !== unit.faction && state.FSD.factions[1] === "") {
                state.FSD.factions[1] = unit.faction;
            } 
            let player = (state.FSD.factions[0] == unit.faction) ? 0:1;
            
            unit.player = player;

            //reset stats
            unit.move = unit.moveMax;
            AttributeSet(unit.charID,"move",unit.move);
            let saveInfo = unit.saveMax;
            saveInfo = saveInfo.split("(");
            let dX = parseInt(saveInfo[0].replace("d",""));
            let numberDice = saveInfo[1] || 1;
            numberDice = parseInt(numberDice);
            let save = {
                number: numberDice,
                dX: dX,
            }
            unit.save = save;
            AttributeSet(unit.charID,"save",unit.saveMax);

            tokenIDs.push(id);
        })

        if (group === true) {
            let groupIDs = tokenIDs.toString();
            //tokens are part of a group of bases, eg. infantry
            for (let i=0;i<tokenIDs.length;i++) {
                let unit = UnitArray[tokenIDs[i]];
                unit.groupIDs = groupIDs;
                unit.token.set("gmnotes",groupIDs);
            }
        }




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
        let losResult = LOS(shooter,target);
        outputCard.body.push("Distance: " + losResult.distance);
        if (losResult.los === false) {
            outputCard.body.push("No LOS to Target");
            outputCard.body.push(losResult.losReason);
        } else {
            outputCard.body.push("LOS to Target");
            if (losResult.cover === true) {
                outputCard.body.push("Target Has Cover");
            }
        }
        PrintCard();
    }


    const LOS = (shooter,target,weapon) => {
        if (!weapon) {
            weapon = {special: " "};
        }
        let los = true;
        let losReason = "";
        let losBlock = "";
        let cover = false;

        let shooterHex = HexMap[shooter.hexLabel];
        let targetHex = HexMap[target.hexLabel];
        let distance = shooterHex.cube.distance(targetHex.cube);
        //firing arc on weapon
        let angle = TargetAngle(shooter,target);
        if (weapon.special.includes("Arc")) {


        }
        //check los now incl cover
        let shooterElevation = shooterHex.elevation + shooter.height;
        let targetElevation = targetHex.elevation + target.height;
        if (shooter.special.includes("Flyer")) {
            if (shooter.token.get(SM.noe) === true) {
                shooterElevation = shooterHex.elevation + 0.5;
            } else if (shooter.token.get(SM.flying) === true) {
                shooterElevation = shooterHex.elevation + 5;
            }
        }
        if (target.special.includes("Flyer")) {
            if (target.token.get(SM.noe) === true) {
                targetElevation = targetHex.elevation + 0.5;
            } else if (target.token.get(SM.flying) === true) {
                targetElevation = targetHex.elevation + 5;
            }
        }

        let pt1 = new Point(0,shooterElevation);
        let pt2 = new Point(distance,targetElevation);

        let interCubes = shooterHex.cube.linedraw(targetHex.cube);

        for (let i=1;i<interCubes.length;i++) {
            let label = interCubes[i].label();
            let interHex = HexMap[label];

            //check for hills
            let pt3 = new Point(i,0);
            let pt4 = new Point(i,interHex.elevation)
            let pt5 = lineLine(pt1,pt2,pt3,pt4);
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
                if (interHex.los.includes("Obscuring")) {
                    cover = true;
log(label + ": Obscuring")
                }
                if (interHex.los.includes("Blocking")) {
                    los = false;
                    losReason = "Blocked by Terrain at " + label;
                    losBlock = label;
                    break;
                }
            }
            //check for terrain on hex side, ignoring adjacent edge to shooter
            if (i > 1) {
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
                    pt3 = new Point(i,interHex.elevation);
                    pt4 = new Point(i,interHex.elevation + edge.height);
                    pt5 = lineLine(pt1,pt2,pt3,pt4);
                    if (pt5) {
                        if (edge.los.includes("Obscuring")) {
                            cover = true;
    log(label + " Edge: Obscuring")
                        }
                    }
                }


            }

        }

        //target hexside
        if (distance > 1) {
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
                pt3 = new Point(distance,targetHex.elevation);
                pt4 = new Point(distance,targetHex.elevation + edge.height);
                pt5 = lineLine(pt1,pt2,pt3,pt4);
                if (pt5) {
                    if (edge.los.includes("Obscuring")) {
                        cover = true;
    log("Target Hex Edge Obscuring")
                    }
                }
            }
        }



        //target hex
        if (targetHex.los.includes("Blocking") || targetHex.los.includes("Obscuring")) {
            cover = true;
log("Target Hex Obscuring")
        }

        //indirect or guided weapons check
        let indirect = false;
      

        if (target.special.includes("Flyer") && target.token.get(SM.flying) === true) {
            cover = false;
        }

        if (distance < 1) {
            cover = false;
        }


        let result = {
            los: los,
            losReason: losReason,
            losBlock: losBlock,
            distance: distance,
            cover: cover,
            indirect: indirect,
        }

log(result)


        return result;
    }




    const Activate = (msg) => {
        let Tag = msg.content.split(";");
        let id = Tag[2];
        let order = Tag[1];
        let unit = UnitArray[id];
        let actions = parseInt(unit.token.get("bar1_value"));
        let targetID = Tag[3]; //in cases of Fire 
        let additionalInfo = Tag[4]; //weapon # or ability #
        let nextRoutine = "";

        let errorMsg = [];
        if (unit.token.get("aura1_color") === "#000000") {
            errorMsg.push("Unit has already activated this turn");
        }

        SetupCard(unit.name,order,unit.faction);

//Activation Dice cost here

//if fire or special ability, check if is ready or free
//if not, can display message to preassign dice first or automatically take dice and proceed ???






        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                outputCard.body.push(msg);
            })
            PrintCard();
            return;
        }



        actions --;

        if (unit.token.get("tint_color") === "#ff0000") {
            order = "Unpin";
            //Unpin
            outputCard.body.push("The Unit Unpins as its Action");
        }

        if (order === "Move") {
            let move = unit.move;
            if (unit.token.get(SM.moved) === true) {
                move = Math.max((unit.move - 1),1);
            }
            outputCard.body.push("The Unit has a Move of " + move + " Hexes" );
            if (unit.token.get(SM.moved) == true && ((unit.move - 1) > 0)) {
                outputCard.body.push("[Reduced by 1 for prev. Movement]");
            }
            outputCard.body.push("Move 1 Hex at a time, taking into account Terrain Costs");
            outputCard.body.push("Rotation at end costs 1 Hex of Movement");

            unit.token.set(SM.moved,true);
        }

        if (order === "Control Objective") {




        }

        if (order.includes("Fire")) {
            FireInfo = {
                shooterID: id,
                targetID: targetID,
                weaponNum: additionalInfo,
            }
            nextRoutine = "Fire";
//? change for CC
        }

        if (order.includes("Ability")) {
            AbilityInfo = {
                id: id,
                targetID: targetID,
                additionalInfo: additionalInfo,
            }
            nextRoutine = "Ability";


        }

        

        outputCard.body.push(actions + " Actions Left");
        unit.token.set("bar1_value",actions);
        if (actions === 0) {
            unit.token.set("aura1_color","#000000");
            outputCard.body.push("Unit's Turn is Over after This Action");
        }
        if (unit.groupIDs !== "") {
            outputCard.body.push("The Action must be taken by all Bases in the Unit");
            let groupIDs = unit.groupIDs.split(",");
            _.each(groupIDs,id => {
                let base = UnitArray[id];
                base.token.set("aura1_color",unit.token.get("aura1_color"));
                base.token.set("bar1_value",actions);
                base.token.set("statusmarkers",unit.token.get("statusmarkers"));
            })
        }


        PrintCard();
        if (nextRoutine === "Fire") {Fire()};
        if (nextRoutine === "Ability") {Ability()};
    }











    const Fire = () => {
        let shooter = UnitArray[FireInfo.shooterID];
        let target = UnitArray[FireInfo.targetID];
        let weapon = shooter.weapons[FireInfo.weaponNum];








        
    }




    const LocationChange = (tok,prev) => {
        let distance = 0;
        let newHex = HexMap[(new Point(tok.get("left"),tok.get("top"))).label()];
        if (newHex.tokenIDs.includes(tok.id) === false) {
            newHex.tokenIDs.push(tok.id);
        }
        let unit = UnitArray[tok.get("id")];
        if (unit) {
            unit.hexLabel = newHex.label;
        }
        let prevHex = HexMap[(new Point(prev.left,prev.top)).label()];
        if (prevHex.tokenIDs.includes(tok.id)) {
            prevHex.tokenIDs.splice(prevHex.tokenIDs.indexOf(tok.id),1);
        }
        distance = newHex.cube.distance(prevHex.cube);
        let info = {
            newHex: newHex,
            prevHex: prevHex,
            distance: distance,
        }
        return info;
    }




    const changeGraphic = (tok,prev) => {
        RemoveLines();
        let info = LocationChange(tok,prev);



        if (state.FSD.turn > 0) {
            let unit = UnitArray[tok.get("id")];
            if (!unit) {return};
            if (info.distance > 0) {
//move back



            }
            //fix the token size in case accidentally changed while game running - need check that game is running
            if (tok.get("width") !== prev.width || tok.get("height") !== prev.height) {
                tok.set({
                    width: prev.width,
                    height: prev.height,
                })
            }
            if (info.newHex.label !== info.prevHex.label) {
                //change facing to match direction
                let angle = Angle(info.prevHex.cube.angle(info.newHex.cube));
                unit.token.set("rotation",angle);


            }




        };
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
                log(state.FSD);
                log("Units");
                log(UnitArray)
                log("Map Areas");
                log(MapAreas)
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!AddAbilities':
                AddAbilities(msg);
                break;
            case '!AddMarker':
                AddMarker(msg);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
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
            case '!Attack':
                Attack(msg);
                break;
            case '!RollD6':
                RollD6(msg);
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
        log("===> FSD <===");
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
