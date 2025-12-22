const GDF3 = (() => {
    const version = '2025.12.18';
    if (!state.GDF3) {state.GDF3 = {}};

    const pageInfo = {};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    let HexSize, HexInfo, DIRECTIONS;
    let activeID;

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
        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
        },
        "Plague Disciples": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/353239057/GIITPAhD-JdRRD2D6BREWw/thumb.png?1691112406",
            "dice": "Deathguard",
            "backgroundColour": "#B3CF99",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#000000",
            "borderStyle": "5px ridge",
        },
        "Alien Hives": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/362007142/CjTYql17F5VDkqGlW_yorg/thumb.png?1696555948",
            "dice": "Tyranids",
            "backgroundColour": "#800080",
            "titlefont": "Goblin One",
            "fontColour": "#f9b822",
            "borderColour": "#f9b822",
            "borderStyle": "5px ridge",
        },


    };

//improve this
    const SM = {
        fatigue: "status_brown",
        halfStr: "status_Blood::2006465",


    }

    const TT = {
        vAAP: "Versatile Attack = +1 AP",
        vATH: "Versatile Attack = +1 to Hit",
        vDD: "Versatile Defense = +1 to Defense",
        vDTH: "Versatile Defense = -1 to Be Hit",
        steadfast: "Steadfast Buff",


    }




    //height is height of terrain element


    const EdgeInfo = {
        "#00ff00": {name: "Hedge", cover: 1, los: false,height: 0.25},
        "#980000": {name: "Wall", cover: 1, los: false, height: 0.25},



    }


    //Cover: 0, 1, 2
    //0 to defense, 0 to hit    
    //0 to defense, -1 to hit
    //+1 to defense, -1 to hit

    //when doing LOS - gets best cover level, and LOS stops if true
    //have to check triangles for LOS/heights
    //height => most are height 1, used to check re higher levels

    const TerrainInfo = {
        "Open": {name: "Open",cover: 0,los: false,height: 0, difficult: false},
        "Woods": {name: "Woods",cover: 1,los: true,height: 1,difficult: true},
        "Building 1": {name: "Building 1",cover: 2,los: true,height: 1,difficult: true, building: true},
        "Building 2": {name: "Building 2",cover: 2,los: true,height: 2, difficult: true, building: true},
        "Crops": {name: "Crops",cover: 1,los: false,height: 0, difficult: false, building: true},



    }

    const HillHeights = {
        //each successive level has a height of 1
        "#000000": 1,
        "#666666": 2,
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

    const pointInPolygon = (point,vertices) => {
        //evaluate if point is in the polygon
        px = point.x
        py = point.y
        collision = false
        len = vertices.length - 1
        for (let c=0;c<len;c++) {
            vc = vertices[c];
            vn = vertices[c+1]
            if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) && (px < (vn.x-vc.x)*(py-vc.y)/(vn.y-vc.y)+vc.x)) {
                collision = !collision
            }
        }
        return collision
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
            let destination = b.toPoint();

            let x = Math.round(origin.x - destination.x);
            let y = Math.round(origin.y - destination.y);
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
            for (var i = 1; i < N; i++) {
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
        //hex will have its elevation and the hexes terrain which can reference TerrainInfo for other details
        constructor(point) {
            this.centre = point;
            let offset = point.toOffset();
            this.offset = offset;
            this.tokenIDs = [];
            this.cube = offset.toCube();
            this.label = offset.label();
            this.elevation = 0;
            this.cover = 0;
            this.terrainHeight = 0;
            this.terrain = "Open";
            this.los = false;
            this.difficult = false;
            this.building = false;
            this.edges = {};
            _.each(DIRECTIONS,a => {
                this.edges[a] = "Open";
            })
            HexMap[this.label] = this;
        }

        distance(b) {
            let dist = this.cube.distance(b.cube);
            return dist;
        }



    }

    class Unit {
        constructor(token) {
            this.charID = token.get("represents");

            let aa = AttributeArray(this.charID);

            this.token = token;
            this.tokenID = token.get("id");
            this.name = token.get("name");

            this.faction = aa.faction;





            this.models = parseInt(aa.models) || 1;
            this.quality = parseInt(aa.quality);
            this.defense = parseInt(aa.defense);
            this.toughness = parseInt(aa.toughness) || 1;

            this.woundsMax = this.models * this.toughness;

            this.type = aa.type;
            let keywords = [];

            //Unit Keywords, separated by a comma
            let unitKey = aa.unitkeywords || " ";
            unitKey = unitKey.split(",");
            _.each(unitKey,key => {
                keywords.push(key.trim());
            })

            //upgrades, which may be in [ ] with flavour text before
            let keywordDisplay = "";
            for (let i=1;i<11;i++) {
                let eq = "key" + i + "equipped";
                let k = "key" + i + "name";
                if (aa[eq] === "Equipped") {
                    let keyword = aa[k].trim();
                    if (!keyword) {continue};
                    if (i > 1) {keywordDisplay += "<br>"};
                    keywordDisplay += keyword;
                    if (keyword.includes("[")) {
                        let i1 = keyword.indexOf("[");
                        let i2 = keyword.indexOf("]");
                        keyword = keyword.substring(i1 + 1,i2);
                    }
                    keyword = keyword.trim();
                    keywords.push(keyword);
                }
            }
            this.keywords = keywords;
log(keywords)
            let weapons = [];
            for (let i=1;i<11;i++) {
                if (aa["weapon" + i + "equipped"] === "Equipped") {
                    let key = (aa["weapon" + i + "special"] || " ").split(",");
                    let keywords = key.map((e) => e.trim()) || [""];

                    let weapon = {
                        name: aa["weapon" + i + "name"],
                        number: parseInt(aa["weapon" + i + "number"]) || 1,
                        type: aa["weapon" + i + "type"],
                        range: parseInt(aa["weapon" + i + "range"]) || 0,
                        attacks: parseInt(aa["weapon" + i + "attack"]) || 1,
                        ap: parseInt(aa["weapon" + i + "ap"]) || 0,
                        keywords: keywords,
                        fx: aa["weapon" + i + "fx"],
                        sound: aa["weapon" + i + "sound"],
                    }
                    weapons.push(weapon);
                }
            }

            let ravage = keywords.find((e) => e.includes("Ravage")) || "0";
            ravage = parseInt(ravage.replace(/\D/g,''));
            if (ravage > 0) {
                let weapon = {name: "Ravage",number: ravage,type: "CCW",range: 0,attacks: 1,ap: 0,keywords: [""],fx: "",sound: "Growl"};
                weapons.push(weapon);
            }

            let impact = keywords.find((e) => e.includes("Impact")) || "0";
            impact = parseInt(impact.replace(/\D/g,''));
            if (impact > 0) {
                let weapon = {name: "Impact",number: impact,type: "CCW",range: 0,attacks: 1,ap: 0,keywords: [""],fx: "",sound: ""};
                weapons.push(weapon);
            }

            this.weapons = weapons;

            this.moved = false;




            UnitArray[this.tokenID] = this;






        }


        Damage (wounds) {
            wounds = parseInt(wounds) || 0; //"No" turns into a 0 this way
            if (wounds === 0) {return};
            //can also 'heal' or repair via this, using neg wounds
            let currentHP = parseInt(this.token.get("bar1_value")) - wounds;
            currentHP = Math.max(0,Math.min(currentHP,this.woundsMax));
            if (currentHP === 0) {
                this.Destroyed();
                return true;
            } else {
                this.token.set("bar1_value",currentHP);
                let wounded = false;
                if (currentHP <= (this.woundsMax/2) && this.type !== "Hero") {
                    wounded = true;
                } 
                this.token.set(SM.halfStr,wounded);
                return false;
            }
        }




        Destroyed () {
            this.token.set("layer","map");
            this.token.set("statusmarkers","");
            this.token.set("status_dead",true);
            delete UnitArray[this.tokenID];
        }

        hexLabel() {
            let token = findObjs({_type:"graphic", id: this.tokenID})[0];
            let label = (new Point(token.get("left"),token.get("top"))).label();
            return label;
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
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];  


        let abilityName,action;
        let abilArray = findObjs({_type: "ability", _characterid: unit.charID});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        
        let types = {
            "Rifle": [],
            "Pistol": [],
            "Heavy": [],
            "Heavy2": [],
            "Heavy3": [],
            "Mod": [],
            "CCW": [],
            "Sniper": [],
            "Bomb": [],
        }
  
        for (let i=0;i<unit.weapons.length;i++) {
            let weapon = unit.weapons[i];
            let name = weapon.name;
            if (weapon.type === " " || weapon.name === " ") {continue}
            if (weapon.keywords.includes("Limited")) {
                name += " (Limited)";
            }
            types[weapon.type].push(name); 
        }
        
        let keys = Object.keys(types);
        let weaponNum = 1;
        for (let i=0;i<keys.length;i++) {
            let names = types[keys[i]];
            if (names.length === 0) {continue};
            names = names.toString();
            if (names.charAt(0) === ",") {names = names.replace(",","")};
            names = names.replaceAll(",","+");
            abilityName = weaponNum + ": " + names;
            weaponNum += 1;
            let ct = (keys[i] === ("CCW")) ? "Melee":"Ranged";
            action = "!Attack;@{selected|token_id};@{target|token_id};" + ct + ";" + keys[i];
            AddAbility(abilityName,action,unit.charID);
        }

        //activation 
        let orders = ";?{Order|Hold|Advance|Charge/Rush}";
        if (unit.type === "Aircraft") {orders = ";Advance"};
        if (unit.keywords.includes("Artillery") || unit.keywords.includes("Immobile")) {orders = ";Hold"}

        action = "!Activate;@{selected|token_id}" + orders;
        AddAbility("Activate",action,unit.charID);









        sendChat("","Abilities Added")
    }

    const ButtonInfo = (phrase,action,inline,level) => {
        //inline - has to be true in any buttons to have them in same line -  starting one to ending one
        if (!inline) {inline = false};
        if (!level) {level = false};
        let info = {
            phrase: phrase,
            action: action,
            inline: inline,
            level: level,
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


    const InlineButtons = (array) => {
        let output = "[FORMATTED]";
        for (let i=0;i<array.length;i++) {
            let info = array[i];
            let inline = true;
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
            
            if (inline === false || i === (array.length - 1)) {
                out += `</div></span></div></div>`;
            }
            output += out;
        }
        return output;
    }







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
            outputCard.side = "Allied";
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
            if (line.includes("[FORMATTED]")) {
                line = line.replace("[FORMATTED]","");
                out += line;
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
        AddElevations();
        AddTerrain();    
        AddEdges();
        AddTokens();
        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };







    //terrain that is edges - hedges, walls, barricades and such
    const AddEdges = () => {
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
        //add terrain using tokens on map page, either on top or under map
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(tokens,token => {
            let name = token.get("name");
            let terrain = TerrainInfo[name];
            if (terrain) {
                let centre = new Point(token.get("left"),token.get('top'));
                let centreLabel = centre.toCube().label();
                let hex = HexMap[centreLabel];
                hex.terrain = name;
                hex.cover = terrain.cover;
                hex.los = terrain.los;
                hex.terrainHeight = terrain.height;
                if (terrain.difficult) {hex.difficult = terrain.difficult};
                if (terrain.building) {hex.building = terrain.building};
            }
        })

    }

    const AddElevations = () => {
        //use terrain lines to build elevations
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});
        _.each(paths,path => {
            let elevation = HillHeights[path.get("stroke").toLowerCase()];
            if (elevation) {
                elevation = parseInt(elevation);
                let vertices = translatePoly(path);
                _.each(HexMap,hex => {
                    let result = pointInPolygon(hex.centre,vertices);
                    if (result === true) {
                        hex.elevation = Math.max(hex.elevation,elevation);
                    }
                });
            }
        });
    }





     
    const AddTokens = () => {
        ModelArray = {};
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
                let unit = new Unit(token);
            }  
        });
        let elapsed = Date.now()-start;
        log(`${c} token${s} checked in ${elapsed/1000} seconds - ` + Object.keys(UnitArray).length + " placed in Array");

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

    const stringGen = () => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            text += possible.charAt(Math.floor(randomInteger(possible.length)));
        }
        return text;
    };







    const TokenInfo = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];

log(unit)
        let label = unit.hexLabel();
        let hex = HexMap[label];

log(hex)
        SetupCard(unit.name,"Info",unit.faction);
        outputCard.body.push("Hex Label: " + label);
        outputCard.body.push("Terrain: " + hex.terrain);
        outputCard.body.push("Elevation: " + hex.elevation);
        outputCard.body.push("Terrain Height: " + hex.terrainHeight);
        outputCard.body.push("Cover Level: " + hex.cover);
        outputCard.body.push("LOS Blocking: " + hex.los);
        PrintCard();
    }


    const RollDice = (msg) => {
        PlaySound("Dice");
        let roll = randomInteger(6);
        let playerID = msg.playerid;
        let id,player;
        if (msg.selected) {
            id = msg.selected[0]._id;
        }
        let faction = "Neutral";

        if (id) {
            faction = UnitArray[id].faction;
            player = state.GDF3.factions.indexOf(faction);
            if (player === -1) {
                state.GDF3.factions.push(faction);
                state.GDF3.playerIDs.push(playerID);
            }
        } else {
           let player = state.GDF3.playerIDs.indexOf(playerID); 
           if (player > -1) {
                faction = state.GDF3.factions[player];
           }  
        }

        let dice = Factions[faction].dice;

        let res = "/direct " + DisplayDice(roll,dice,40);
        PlaySound("Dice");
        sendChat("player|" + playerID,res);
    }






    const ClearState = (msg) => {
        LoadPage();
        BuildMap();

        //clear arrays
        UnitArray = {};

        state.GDF3 = {
            playerIDs: [],
            factions: [],
            turn: 0,

        }

        sendChat("","Cleared State/Arrays");
    }


    const RemoveDead = (info) => {
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "map",
        });
        tokens.forEach((token) => {
            if (token.get("status_dead") === true) {
                token.remove();
            }
            let removals = ["Objective","Turn"];
            for (let i=0;i<removals.length;i++) {
                if (token.get("name").includes(removals[i]) && info === "All") {
                    token.remove();
                }
            }
        });
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
   

    const Auras = (unit) => {
        ///checks if model or assoc leader has an active aura and returns their names
        let auras = unit.keywords.filter((e) => e.includes("Aura"));
        let associated = Associated(unit);
        if (associated && associated !== false) {
            auras = auras.concat(associated.keywords.filter((e) => e.includes("Aura")));
        }
        auras = auras.map((e) => e.replace(" Aura",""));
        auras = [...new Set(auras)];
        return auras;
    }

    const TTip = (unit) => {
        let tooltip = unit.token.get("tooltip") || "";
        tooltip = tooltip.split(",");
        tooltip = tooltip.map((e) => e.trim());
        return tooltip;
    }

    const RemoveTTip = (unit,tip) => {
        let tooltip = unit.token.get("tooltip") || "";
        tooltip = tooltip.split(",");
        tooltip = tooltip.map((e) => e.trim());
        tip = TT.tip;
        let index = tooltip.indexOf(tip);
        if (index > -1) {
            tooltip.splice(index,1);
            unit.token.set("tooltip",tooltip);
        }
    }

    const Associated = (unit) => {
        if (unit.type !== "Hero" && unit.models === 1) {return false};
        let label = unit.hexLabel();
        let associated = false;
        let keys = Object.keys(UnitArray);
        for (let i=0;i<keys.length;i++) {
            if (keys[i] === unit.tokenID) {continue};
            let unit2 = UnitArray[keys[i]];
            if (unit2.faction !== unit.faction) {continue};
            if (unit2.type !== "Hero" && unit.models === 1) {continue};
            if (unit2.hexLabel() === label) {
                associated = unit2;
                break;
            }
        }
        return associated;
    }




    const Activate = (msg) => {
        let Tag = msg.content.split(";");
        let id = Tag[1];
        let order = Tag[2];
        let unit = UnitArray[id];

        let unitAuras = Auras(unit);
        let unitTT = TTip(unit);
        let note = false;
        let ignoreDifficult = false;

        //RemoveDead();

//redo to have difMove === move if has strider etc


        SetupCard("Activate " + unit.name,"",unit.faction);

        if ((unit.keywords.includes("Steadfast") || unitAuras.includes("Steadfast") || unitTT.includes("steadfast")) && (unit.token.get("tint_color") === "#ffff00")) {
            let steadRoll = randomInteger(6);
            if (steadRoll > 3) {
                unit.token.set("tint_color","transparent");
                if (unitTT.includes("steadfast")) {
                    RemoveTip(unit,TT.steadfast);
                    outputCard.body.push("Steadfast Buff Used, Unit Rallies!");
                } else {
                    outputCard.body.push("Steadfast! Unit Rallies!");
                }
            }
        }

        activeID = id;

        if (unit.token.get("tint_color") === "#ffff00") {
            //shaken
            order = "Rally";
        }

        if ((unit.keywords.includes("Bounding") || unitAuras.includes("Bounding")) && order !== "Rally") {
            let roll = random(2);
            outputCard.body.push("The Unit may immediately be placed anywhere within " + roll + " Hexes")
        }


        outputCard.subtitle = order;
        unit.token.set("aura1_color","#000000");

        let move = 3;
        if (unit.keywords.includes("Fast")) {
            note = true;
            move++
            outputCard.body.push("Unit has Fast and has +1 to Move");
        };
        if (unit.keywords.includes("Very Fast")) {
            note = true;
            move += 2
            outputCard.body.push("Unit has Very Fast and has +2 to Move");
        }
        if (unit.keywords.includes("Slow")) {
            note = true;
            move--;
            outputCard.body.push("Unit has Slow and has -1 to Move");
        }

    //othter modifiers

        let charge = move * 2;
        let rush = move * 2;

        if (unit.keywords.includes("Agile")) {
            charge += 1, rush+= 1;
            note = true;
            outputCard.body.push("Unit has Agile and has +1 to Charge/Rush");
        }
        if (unit.keywords.includes("Rapid Charge") || unitAuras.includes("Rapid Charge")) {
            note = true;
            outputCard.body.push("Unit has Rapid Charge and has +2 to Charge");
            charge += 2;
        }
        if (unit.keywords.includes("Rapid Rush")) {
            note = true;
            outputCard.body.push("Unit has Rapid Rush and has +3 to Rush");
            rush += 3;
        }




        if (unit.keywords.includes("Strider")) {
            note = true;
            outputCard.body.push("Unit has Strider and may ignore the effects of Difficult Terrain");
            ignoreDifficult = true;
        }
        if (unit.keywords.includes("Fly")) {
            note = true;
            outputCard.body.push("Unit has Flying and may Ignore Terrain and Units while Moving");
            ignoreDifficult = true;
        }
        if (unit.type === "Aircraft") {
            note = true;
            ignoreDifficult = true;
            outputCard.body.push("Unit is an Aircraft and Ignores Units and Terrain");
        }

        if (note === true) {
            outputCard.body.push("[hr]");
        }


        let difMove = (ignoreDifficult === false) ? Math.min(move,3):move;
        let difCharge = (ignoreDifficult === false) ? Math.min(charge, 3): charge;
        let difRush = (ignoreDifficult === false) ? Math.min(rush,3): rush;

        let startHex = HexMap[unit.hexLabel()];

        if (unit.type === "Aircraft") {
            move = "15-18";
        }

        let situation = 1; //open
        if (startHex.difficult === true && startHex.building === false && ignoreDifficult === false) {situation = 2}; //difficult but not building
        if (startHex.building === true) {situation = 3}; //building


        switch(order) {
            case 'Hold':
                outputCard.body.push("Unit stays in Place and may Fire");
                break;
            case 'Advance':
                if (situation === 1) {
                    outputCard.body.push("Advance is " + move + " Hexes");
                    if (difMove !== move) {
                        outputCard.body.push("Entering or Crossing Difficult Terrain limits Advance to " + difMove + " Hexes");
                    }
                }
                if (situation === 2) {
                    outputCard.body.push("Unit starts in Difficult Ground");
                    outputCard.body.push("Advance is " + difMove + " Hexes");
                }
                if (situation === 3) {
                    outputCard.body.push("Unit starts in a Building");
                    outputCard.body.push("Advance is " + difMove + " Hexes, to a maximum of 3 Hexes from any part of the Building");
                }
                break;
            case 'Charge/Rush':
                if (situation === 1) {
                    if (charge === rush) {
                        outputCard.body.push("Charge/Rush is " + charge + " Hexes");
                    } else {
                        outputCard.body.push("Charge is " + charge + " Hexes, Rush is " + rush + " Hexes");
                    }
                    if (difMove !== move) {
                        if (charge === rush) {
                            outputCard.body.push("Entering or Crossing Difficult Terrain limits Charge/Rush to " + difCharge + " Hexes");
                        } else {
                            outputCard.body.push("Entering/Crossing Difficult Terrain limits Charge to " + difCharge + " Hexes and Rush to " + difRush + " Hexes");
                        }
                    }
                }
                if (situation === 2) {
                    outputCard.body.push("Unit starts in Difficult Ground");
                    if (difCharge !== difRush) {
                        outputCard.body.push("Charge is " + difCharge + " Hexes");
                        outputCard.body.push("Rush is " + difRush + " Hexes");
                    } else {
                        outputCard.body.push("Charge/Rush is " + difCharge + " Hexes");
                    }
                }
                if (situation === 3) {
                    outputCard.body.push("Unit starts in a Building");
                    if (difCharge !== difRush) {
                        outputCard.body.push("Charge is " + difCharge + " Hexes");
                        outputCard.body.push("Rush is " + difRush + " Hexes");
                    } else {
                        outputCard.body.push("Charge/Rush is " + difCharge + " Hexes");
                    }
                    outputCard.body.push("To a maximum of 3 Hexes from any part of the Building");



                }
                if (unit.keywords.includes("Hit and Run Fighter")) {
                    outputCard.body.push("The Unit may move up to 2 Hexes after Melee");
                }
                break;
            case 'Rally':
                outputCard.body.push("Unit Stays in Hex and Rallies");
                unit.token.set("tint_color","transparent");
                break;
        }


        if (unit.keywords.includes("Versatile Attack") || unitAuras.includes("Versatile Attack")) {
            outputCard.body.push("Unit has Versatile Attack")
            let buttons = [];
            buttons.push({
                phrase: "Choose +1 AP",
                action: "!SetTT;vAAP",
            })
            buttons.push({
                phrase: "Choose +1 to Hit",
                action: "!SetTT;vATH",
            })
            outputCard.body.push(InlineButtons(buttons));
        }
        if (unit.keywords.includes("Versatile Defense") || unitAuras.includes("Versatile Defense")) {
            outputCard.body.push("Unit has Versatile Defense")
            let buttons = [];
            buttons.push({
                phrase: "Choose +1 Defense",
                action: "!SetTT;vDD",
            })
            buttons.push({
                phrase: "Choose -1 to Hit",
                action: "!SetTT;vDTH",
            })
            outputCard.body.push(InlineButtons(buttons));
        }

        



        PrintCard();


    }


    const Morale = (msg) => {
        let Tag = msg.content.split(";");
        let units = [];
        let unit = UnitArray[Tag[1]];
        if (!unit) {return};
        units.push(unit);

        let melee = unit.melee;

        let associated = Associated(unit);
        if (associated !== false) {
            if (associated.melee === true) {
                melee = true;
            }
            units.push(associated);
        }

        for (let i=0;i<units.length;i++) {
            let unit = units[i];
            if (!unit) {return};

            let unitAuras = Auras(unit);
            let roll = randomInteger(6);
            let target = unit.quality;
            let fearless = false;
            let shaken = false;
            //mods
            if (unit.keywords.includes("Hive Bond") || unitAuras.includes("Hive Bond")) {
                target--;
            }
            if (unit.keywords.includes("Hive Bond Boost") || unitAuras.includes("Hive Bond Boost")) {
                target -= 2;
            }

            let success = (roll >= target) ? true:false;
            let subtitle = "Needing " + target + "+";

            //Shaken
            if (unit.token.get("tint_color") === "#ff0000") {
                //shaken
                success = false;
                shaken = true;
                subtitle = "Shaken";
            }







            //fearless
            if (unit.keywords.includes("Fearless") && success === false) {
                //can overcome shaken
                subtitle += " & Fearless";
                let fearlessRoll = randomInteger(6);
                if (fearlessRoll > 3) {
                    success = true;
                    shaken = false;
                }
                fearless = "Fearless: " + DisplayDice(fearlessRoll,Factions[unit.faction].dice,32) + " vs. 4+";
            }



            //after failure changes - automatic
            auto = [];
            if (unit.keywords.includes("No Retreat") && success === false) {
                success = "Auto";
                auto.push("The Test is Passed due to No Retreat");
                let hp = parseInt(unit.token.get("bar1_value"));
                let wounds = 0;
                let noRRolls = [];
                _.each(hp,e => {
                    let roll = randomInteger(6);
                    noRRolls.push(roll);
                    if (roll < 4) {wounds++};
                })
                noRRolls = noRRolls.sort((a,b) => b-a);
                let tip = "Rolls: " + noRRolls + " vs. 4+";
                tip = '[' + wounds + '](#" class="showtip" title="' + hitTip + ')';
                auto.push("No Retreat causes " + tip + " Wounds");
                let destroyed = unit.Damage(wounds);
                if (destroyed === true) {
                    auto.push(unit.name + " is Destroyed!");
                }
            }








            SetupCard(unit.name,subtitle,unit.faction);
            if (fearless !== false) {
                outputCard.body.push(fearless);
            }
            outputCard.body.push("[hr]");
            if (success === "Auto") {
                _.each(auto,line => {
                    outputCard.body.push(line);
                })
            } else if (success === true) {
                outputCard.body.push("Morale Roll: " + DisplayDice(roll,Factions[unit.faction].dice,32));
                outputCard.body.push("Success!");
            } else if (success === false) {
                if (melee === true && unit.token.get(SM.halfStr)) {
                    outputCard.body.push("Morale Roll: " + DisplayDice(roll,Factions[unit.faction].dice,32));
                    outputCard.body.push("Failure! Unit Routs from Melee!");
                    unit.Destroyed();
                    outputCard.body.push("Consolidation Moves may be taken");
                } else if (shaken === false) {
                    outputCard.body.push("Morale Roll: " + DisplayDice(roll,Factions[unit.faction].dice,32));
                    outputCard.body.push("Failure! Unit is Shaken");
                    unit.token.set("tint_color","#ff0000");
                } else if (shaken === true) {
                    outputCard.body.push("Shaken Unit Routs!");
                    unit.Destroyed();
                }


            }






            PrintCard();

        }



    }


    const SetTT = (msg) => {
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        let Tag = msg.content.split(";");
        let type = Tag[1];
        let info = TT[type];
        let tooltip;
        if (unit) {
            tooltip = unit.token.get("tooltip");
            tooltip += "," + info;
            unit.token.set("tooltip",tooltip);
            sendChat("",info + " Set");
        }
    }





    
    const CheckLOS = (msg) => {
        let Tag = msg.content.split(";");
        let shooterID = Tag[1];
        let targetID = Tag[2];
        let shooter = UnitArray[shooterID];
        if (!shooter) {
            sendChat("","Not in Array");
            return;
        }
        let target = UnitArray[targetID];
        if (!target) {
            sendChat("","Not in Array");
            return;
        }

        let losResult = LOS(shooter,target);

        SetupCard(shooter.name,"LOS",shooter.faction);
        outputCard.body.push("Distance: " + losResult.distance);
        let wlos = [];
        _.each(shooter.weapons,weapon => {
            let range = (target.type === "Aircraft" && weapon.keywords.includes("Unstoppable") === false) ? weapon.range - 6:weapon.range;
            if (losResult.distance <= range) {
                if (losResult.los === true || weapon.keywords.includes("Indirect")) {
                    wlos.push(weapon.name);
                }
            } 
        })

        if (wlos.length === 0) {
            if (losResult.los === false) {
                outputCard.body.push("No LOS To Target");
                outputCard.body.push(losResult.losReason);
            } else {
                outputCard.body.push("LOS to target, but no Weapons in Range");
            }
        } else {
            outputCard.body.push("LOS to Target");
            _.each(wlos,name => {
                outputCard.body.push(name + " has Range");
            })
            let cover = ["No Cover","Soft Cover","Hard Cover"];
            cover = cover[Math.max(losResult.targetHexCover,losResult.interveningCover)];
            outputCard.body.push("Target has " + cover);
        }
        PrintCard();
    }


    const LOS = (shooter,target) => {
        let shooterHex = HexMap[shooter.hexLabel()];
        let shooterElevation = shooterHex.elevation;
        if ((shooter.type.includes("Infantry") || shooter.type.includes("Hero")) && shooterHex.terrain.includes("Building")) {
            shooterElevation += Math.max(shooterHex.terrainHeight - 1,0);
        }
        let targetHex = HexMap[target.hexLabel()];
        let targetElevation = targetHex.elevation;
        if ((target.type.includes("Infantry") || target.type.includes("Hero")) && targetHex.terrain.includes("Building")) {
            targetElevation += Math.max(targetHex.terrainHeight - 1,0);
        }

log("Shooter: " + shooter.name)
log("Elevation: " + shooterElevation)
log("Target: " + target.name)
log("Elevation: " + targetElevation)


        let distance = shooterHex.distance(targetHex);
        if (shooter.type === "Titan") {distance -= 1};
        if (target.type === "Titan") {distance -= 1};
        let los = true;
        let losReason = "";

        let interveningCover = 0;

        if (shooter.type !== "Aircraft") {   
            let pt1 = new Point(0,shooterElevation);
            let pt2 = new Point(distance,targetElevation);
            let pt3,pt4,pt5;
            let interCubes = shooterHex.cube.linedraw(targetHex.cube);
            let interLabels = interCubes.map((e) => e.label());
log(interCubes)
log(interLabels)
            for (let i=0;i<interCubes.length;i++) {
                let label = interCubes[i].label();
log(label)
                let interHex = HexMap[label];
                //check for hills
                pt3 = new Point(i,0);
                pt4 = new Point(i,interHex.elevation);
                pt5 = lineLine(pt1,pt2,pt3,pt4);

                if (pt5 && label !== targetHex.label) {
                    los = false;
                    losReason = "Blocked by Elevation at " + label;
                    break;
                }

                //check for terrain in hex
                pt3 = new Point(i,interHex.elevation);
                pt4 = new Point(i,interHex.elevation + interHex.terrainHeight);
                pt5 = lineLine(pt1,pt2,pt3,pt4);

                if (pt5) {
                    if (interHex.los === true) {
                        los = false;
                        losReason = "Blocked by Terrain at " + label;
                        break;
                    } 
                    interveningCover = Math.max(interveningCover,hex.cover);
                }

                //check for terrain edges here
                //all edges are walls or hedges, soft cover, and skip if shooter/target not at same height
                if (shooterElevation === targetElevation) {
                    if ((i+1) === interCubes.length) {
                        ic = targetHex.cube;
                    } else {
                        ic = interCubes[i+1];
                    }
                    let delta = ic.subtract(interCubes[i]);
                    let dir;
                    for (let j=0;j<6;j++) {
                        let d = HexInfo.directions[DIRECTIONS[j]];
                        if (delta.q === d.q && delta.r === d.r) {
                            dir = DIRECTIONS[j];
                            break;
                        }
                    }            
                    let edge = interHex.edges[dir];
                    if (edge !== "Open") {
                        pt3 = new Point(i,interHex.elevation);
                        pt4 = new Point(i,interHex.elevation + edge.height);
                        pt5 = lineLine(pt1,pt2,pt3,pt4);
                        if (pt5) {
                            interveningCover = Math.max(interveningCover,edge.cover);
                        }
                    }
                }
            }

            if (shooterElevation === targetElevation) {
                //check for intervening models using intercubes
                _.each(UnitArray,unit => {
log(unit.name + " : " + unit.tokenID)
                    let label = unit.hexLabel();
log(label)

                    if (unit.tokenID !== shooter.tokenID && unit.tokenID !== target.tokenID && unit.type !== "Hero" && interLabels.includes(label) && unit.type !== "Aircraft") {
                        los = false;
                        losReason = "Blocked by Unit at " + label;
                    }
                })
            }





        } 

        let result = {
            los: los,
            targetHexCover:  (target.type === "Aircraft") ? 0:targetHex.cover,
            interveningCover: interveningCover,
            distance: distance,
            losReason: losReason,
        }

        return result;
    }

    const Attack = (msg) => {
        let Tag = msg.content.split(";");
        let attacker = UnitArray[Tag[1]];
        let attackerAuras = Auras(attacker);
        let attackerTT = TTip(attacker);
        let attackerHex = HexMap[attacker.hexLabel()];
        let defender = UnitArray[Tag[2]];
        let combatType = Tag[3];  //Ranged, Melee
        let weaponType = Tag[4]; //CCW, Rifle etc
        let errorMsg = [];

        if (attacker.faction === defender.faction) {
            //see if can find the unit meant to be clicked on
            let flag = false;
            _.each(UnitArray,unit => {
                if (unit.faction !== attacker.faction && unit.hexLabel() === attackerHex.label) {
                    defender = unit;
                    flag = true;
                }
            })
            if (flag === false) {
                errorMsg.push("Friendly Fire!");
            }
        }

        let defenderHex = HexMap[defender.hexLabel()];


        let attackers = [attacker];
        let defenders = [defender];
        let defenderModelMax = defender.models; //used for morale;
        let defenderModels = Math.ceil(parseInt(defender.token.get("bar1_value")) / defender.toughness); //used for blast

        //check if assoc infantry for either if heros, add to start of array
        //for attacker, only combine if melee,otherwise each fires independently
        if (attacker.type === "Hero" && combatType === "Melee") {
            _.each(UnitArray,unit => {
                if (unit.faction === attacker.faction && unit.models > 1 & unit.hexLabel() === attackerHex.label) {
                    attackers.unshift(unit);
                }
            })
        }
        if (defender.type === "Hero") {
            _.each(UnitArray,unit => {
                if (unit.faction === defender.faction && unit.models > 1 & unit.hexLabel() === defenderHex.label) {
                    defenders.unshift(unit);
                    defenderModelMax += unit.models;
                    defenderModels += Math.ceil(parseInt(unit.token.get("bar1_value")) / unit.toughness);
                }
            })
        }
        //check if assoc hero, add to end of array
        if (attacker.models > 1) {
            _.each(UnitArray,unit => {
                if (unit.faction === attacker.faction && unit.type === "Hero" & unit.hexLabel() === attackerHex.label) {
                    attackers.push(unit);
                }
            })
        }
        if (defender.models > 1) {
            _.each(UnitArray,unit => {
                if (unit.faction === defender.faction && unit.type === "Hero" & unit.hexLabel() === defenderHex.label) {
                    defenders.push(unit);
                    defenderModelMax += 1;
                    defenderModels += 1;
                }
            })
        }

        if (attackers.length === 0 || defenders.length === 0) {sendChat("","Someones not in Array");return};

        defender = defenders[0]; //will shift to an assoc unit if hero was initially targeted
        let defenderAura = Auras(defender);
        let defenderTT = TTip(defender);

        let losResult = LOS(attacker,defender);

        let upTH = 0,upAP = 0;
        if (attacker.keywords.includes("Unpredictable") || (attacker.keywords.includes("Unpredictable Fighter") && combatType === "Melee")) {
            let roll = randomInteger(6);
            if (roll < 4) {
                upAP = 1;
            } else {
                upTH = 1;
            }
        }






        let weaponArray = [];
        let no = [];
        let totalWounds = 0;
        for (let i=0;i<attacker.weapons.length;i++) {
            let weapon = DeepCopy(attacker.weapons[i]);
            if (weapon.type !== weaponType) {continue};
            if (weapon.name === "Impact" && (attacker.token.get(SM.fatigue) === true || attacker.id !== activeID)) {
                continue;
            }
            if (losResult.los === false && weapon.keywords.includes("Indirect") === false) {
                no.push(weapon.name + " - no LOS");
                continue;
            }
            let range = (defender.type === "Aircraft" && weapon.keywords.includes("Unstoppable") === false) ? weapon.range - 6:weapon.range;
            if (attacker.keywords.includes("Increased Shooting Range") || attackerAuras.includes("Increased Shooting Range")) {
                range += 3;
            }
            if (losResult.distance > range) {
                no.push(weapon.name + " - lacks Range");
                continue;
            }
            weaponArray.push(weapon); //can add hits, rolls etc 
        }


        if (weaponArray.length === 0) {
            errorMsg.push("No Weapons with LOS or Range");
            errorMsg = errorMsg.concat(no);
        }

        SetupCard(attacker.name,defender.name,attacker.faction);

        if (combatType === "Melee" && losResult.distance > 0) {
            errorMsg.push("Not in Contact");
        }

        if (errorMsg.length > 0) {
            _.each(errorMsg,error => {
                outputCard.body.push(error);
            })
            PrintCard();
            return;
        }

        //run through weapons, roll to hit/save any hits
        let quality = attacker.quality;







        let weaponHits = [];
log(weaponArray)
        _.each(weaponArray,weapon => {
            let weaponOut;
            let rolls = [], hits = 0, crits = 0
            let relentless = 0,surge = 0, furious = 0,predator = 0,butcher = 0;
            let notes = [];
            let needed = quality; 
            let neededTip = "<br>Quality: " + quality + "+";
            if (attacker.token.get(SM.fatigue) === true && combatType === "Melee") {
                needed = 6;
                neededTip = "<br>Fatigue: 6+";
            }


            if (weapon.name === "Ravage") {
                needed = 6;
                neededTip = "<br>Ravage: 6+";
            }
            if (weapon.name === "Impact") {
                needed = 2;
                neededTip = "<br>Impact: 2+";
            }



            if (weapon.keywords.includes("Reliable")) {
                needed = 2;
                neededTip = "<br>Reliable: 2+";
            }
            let blast = weapon.keywords.find(key => key.includes("Blast")) || "0";
            blast = parseInt(blast.replace(/\D/g,''));

            let cover;
            let hitTip = "", tip;
            //modifiers here
            //cover
            let ignoreCover = ["Unstoppable","Blast","Slam"];
            if (weapon.keywords.includes("Indirect")) {
                cover = losResult.targetHexCover;
            } else {
                cover = Math.max(losResult.targetHexCover,losResult.interveningCover);
            }

            if (cover > 0) {
                for (let i=0;i<weapon.keywords.length; i++) {
                    for (let j=0;j<ignoreCover.length;j++) {
                        if (weapon.keywords[i].includes(ignoreCover[j])) {
                            cover = 0;
                            neededTip += "<br>" + ignoreCover[j] + " ignores Cover";
                        }
                    }
                }  
            }

            if (cover > 0 && weapon.type !== "CCW") {
                needed += 1;
                neededTip += "<br>Cover -1 to Hit";
            }
            if (attacker.keywords.includes("Artillery") && losResult.distance > 4) {
                needed -= 1;
                neededTip += "<br>Artillery at Range +1 to Hit";
            }
            if (weapon.keywords.includes("Indirect") && attacker.moved === true && weapon.keywords.includes("Unstoppable") == false) {
                needed += 1;
                neededTip += "<br>Indirect and Moved -1 to Hit";
            }
            if (defender.keywords.includes("Stealth") && weapon.keywords.includes("Unstoppable") === false) {
                needed += 1;
                neededTip += "<br>Stealth -1 to Hit";
            }
            if (upTH === 1) {
                needed -= 1;
                neededTip += "<br>Unpredictable +1 to Hit";
            }
            if (upAP === 1) {
                weapon.ap++;
                notes.push("Unpredictable +1 to AP");
            }
            if (attackerTT.includes(TT.vATH)) {
                needed -= 1;
                neededTip += "<br>" + TT.vATH;
            }
            if (attackerTT.includes(TT.vAAP)) {
                weapon.ap++;
                notes.push("<br>" + TT.vAAP);
            }
            if (attacker.id === activeID && combatType === "Melee" && weapon.keywords.includes("Thrust")) {
                weapon.ap++;
                notes.push("Thrust");
                needed -= 1;
                neededTip += "<br>Thrust/Charge +1 to Hit";
            }
            if (defenderTT.includes(TT.vDTH) && weapon.keywords.includes("Unstoppable") === false) {
                needed += 1;
                neededTip += "<br>" + TT.vDTH;
            }
            if (attacker.keywords.includes("Precise")) {
                needed -= 1;
                neededTip += "<br>Precise +1 to Hit";
            }
            if (attacker.token.get(SM.halfStr) && weapon.keywords.includes("Unstoppable") === false) {
                needed ++;
                neededTip += "<br>Wounded -1 to Hit";
            }




            needed = Math.min(6,Math.max(2,needed)); //1 is always a miss, 6 a hit

            let dice = weapon.number * weapon.attacks;


///? may be different if weapons have counter
            if (weapon.name === "Impact" && defender.keywords.includes("Counter")) {
                dice -= defender.models;
            }



            do {
                let roll = randomInteger(6);
                rolls.push(roll);


                if (roll >= needed) {
                    hits++;
                    if (roll === 6) {
                        crits++;
                        if ((weapon.keywords.includes("Relentless") || attackerAuras.includes("Relentless")) && losResult.distance > 4) {
                            relentless++;
                        }
                        if (weapon.keywords.includes("Surge")) {
                            surge++;
                        }
                        if (attacker.keywords.includes("Furious") || attackerAuras.includes("Furious")) {
                            furious++;
                        }
                        if (attacker.keywords.includes("Predator Fighter")) {
                            predator++;
                            let roll = randomInteger(6);
                            rolls.push(roll);
                            if (roll >= needed) {
                                hits++;
                            }
                        }
                        if (weapon.keywords.includes("Butcher")) {
                            butcher++;
                        }


                    }
                    




                }
                
                dice--;
            } while (dice > 0);

            if (predator > 0) {
                s = (predator === 1) ? "":"s";
                hitTips += "<br<Predator Fighter added " + predator + " Attack" + s;
            }
            if (butcher > 0) {
                s = (butcher === 1) ? "":"s";
                hitTips += "<br<Butcher added " + butcher + " hit" + s;
            }

            if (furious > 0) {
                hits += furious;
                s = (furious === 1) ? "":"s";
                hitTip += "<br>Furious added " + furious + " hit" + s;
            }
            if (relentless > 0) {
                hits += relentless;
                s = (relentless === 1) ? "":"s";
                hitTip += "<br>Relentless added " + relentless + " hit" + s;
            }
            if (surge > 0) {
                hits += surge;
                s = (surge === 1) ? "":"s";
                hitTip += "<br>Surge added " + surge + " hit" + s;
            }



            if (blast > 0 && hits > 0) {
                let blastHits = Math.min(defenderModels,blast);
                if (blastHits > 1) {
                    //if 1 model, blast does no extra hits
                    hitTip += "<br>Blast adds " + ((blastHits-1) * hits) + " hits"
                    hits *= blastHits;
                }

            }

            rolls = rolls.sort((a,b)=>b-a);
            hitTip = "Rolls: " + rolls.toString() + " vs. " + needed + "+" + neededTip + hitTip;
            let noun = (weapon.number === 1) ? " Misses":" Miss"
            if (hits > 0) {
                let s = (hits === 1) ? "":"s";
                tip = '[' + hits + '](#" class="showtip" title="' + hitTip + ')';
                weaponOut = tip + ' hit' + s + ' with ' + weapon.name ;
                let info = {
                    hitOut: weaponOut,
                    weapon: weapon,
                    crits: crits,
                    hits: hits,
                    cover: cover,
                    notes: notes,
                }
                weaponHits.push(info);
            } else {
                tip = '[' + noun + '](#" class="showtip" title="' + hitTip + ')';
                outputCard.body.push(weapon.name + tip);
            }




            



        })


        let active = true;
        if (weaponHits.length > 0) {
            let results = ApplyDamage(weaponHits,defenders);
            totalWounds = results.totalWounds;
            active = results.active;
            if (weaponHits.length > 1) {
                outputCard.body.push("[hr]");
                outputCard.body.push("Total Wounds Inflicted: " + totalWounds);
            }
        }

        if (active === true) {
            if (combatType === "Melee") {
                let cr = totalWounds;
                let fear = attacker.keywords.find((e) => e.includes("Fear")) || "0";
                fear = parseInt(fear.replace(/\D/g,''));
                if (fear > 0) {
                    outputCard.body.push("Add " + fear + " for Combat Resolution for Fear");
                    cr += fear;
                }

                outputCard.body.push("Melee CR: " + cr);
            } else if (weaponHits.length > 0) {
                //check for morale
                let current = 0;
                let total = 0;
                _.each(defenders,defender => {
                    current += parseInt(defender.token.get("bar1_value")) || 0;
                    total += parseInt(defender.woundsMax);
                })
                if ((current/total) <= 0.5) {
                    outputCard.body.push("Defenders take a Morale Test");
                    let action = "!Morale;" + defender.tokenID;
                    ButtonInfo("Morale Check",action);

                }


            }
        } else if (active === false && combatType === "Melee") {
            outputCard.body.push("[hr]");
            outputCard.body.push(attacker.name + " can make a Consolidation Move of 2 hexes");
        }



        if (attacker.type !== "Aircraft") {
            let angle = attackerHex.cube.angle(defenderHex.cube);
            attacker.token.set('rotation',angle);
        }



        //fatigue and melee flag
        if (combatType === "Melee") {
            attacker.token.set(SM.fatigue,true);
            attacker.melee = true;
            _.each(defenders,defender => {
                if (defender) {
                    defender.melee = true;
                }
            })
        } else {
            attacker.fired = true;
            attacker.melee = false;
            _.each(defenders,defender => {
                if (defender) {
                    defender.melee = false;
                }
            })
        }

        PrintCard();

    }


const ApplyDamage = (weaponHits,defenders) => {
    //crits is subset. of hits
    //if more than one defender (hero) then apply to 1st until dead etc.

    const WeaponOutput = (results) => {
        output.push(results.hitOut);

        results.rolls.sort((a,b) => b - a);
        let tip = "Rolls: " + results.rolls.toString() + " vs. " + results.needed + "+";
        tip += results.neededTip + results.deadlyTip;
        if (results.bane > 0) {
            let s = (results.bane === 1) ? "":"s";
            tip += "<br>Bane caused " + results.bane + " Reroll" + s;
        }
        if (results.rending > 0) {
            let s = (results.rending === 1) ? "":"s";
            tip += "<br>Rending affected " + results.rending + " Roll" + s;
        }
        if (results.slam > 0) {
            let s = (results.slam === 1) ? "":"s";
            tip += "<br>Slam added " + results.slam + " Wound" + s;
        }
        if (results.rupture > 0) {
            let s = (results.rupture === 1) ? "":"s";
            tip += "<br>Rupture added " + results.rupture + " Wound" + s;
        }

        let s = (results.saves === 1) ? "":"s";
        let s2 = (results.wounds === 1) ? "":"s";
        if (results.saves === 0) {results.saves = "No"};
        let c = "[#ff0000]",c1 = "[/#]";
        if (results.wounds === 0) {
            results.wounds = "No"
            c = "",c1 = "";
        };

        tip = '[' + results.saves + '](#" class="showtip" title="' + tip + ')';
        output.push(tip + " Save" + s + " Made");
        _.each(results.reduce,reduce => {
            if (reduce.rolls.length > 1) {
                reduce.rolls = reduce.rolls.sort((a,b) => b-a);
            }
            tip = "Rolls: " + reduce.rolls.toString() + " vs. " + reduce.target + "+"; 
            tip = '[' + reduce.wounds + '](#" class="showtip" title="' + tip + ')';
            let s = (reduce.wounds === 1) ? "":"s";
            output.push(tip + " Wound" + s + reduce.verb + " by " + reduce.reason);
        })


        output.push(c + results.defender.name + ' takes ' + results.wounds + " Wound" + s2 + c1) ;
        destroyed = results.defender.Damage(results.wounds);
        if (destroyed === true) {
            output.push("[#ff0000]" + results.defender.name + " is Destroyed![/#]");
        }
        output.push("[hr]");
    }

    //sort weapon hits to put any deadly weapons first
    weaponHits = weaponHits.sort((a,b) => {
        let ad = a.weapon.keywords.find((e) => e.includes("Deadly")) ? true:false;
        let bd = b.weapon.keywords.find((e) => e.includes("Deadly")) ? true:false;
        if (ad === bd) {return 0};
        if (ad === true && bd === false) {return -1};
        if (ad === false && bd === true) {return 1};
    })


    let output = [];
    let totalWounds = 0;
    let currentDefender = 0;
    let active = true;

    weaponLoop:
    for (let w = 0;w<weaponHits.length; w++) {
        let weapon = weaponHits[w].weapon;
        let crits = weaponHits[w].crits;
        let hits = weaponHits[w].hits;
        let cover = weaponHits[w].cover;

        let unitWounds = 0;
        let results = ZeroResults();
        results.hitOut = weaponHits[w].hitOut;

        let deadly = weapon.keywords.find((e) => e.includes("Deadly")) ||  "0";
        deadly = parseInt(deadly.replace(/[^\d]/g,""));


        let defender = defenders[currentDefender];
        results.defender = defender;

        let defenderAuras = Auras(defender);
        let defenderTT = TTip(defender);
log(defenderAuras)
        let hp = parseInt(defender.token.get("bar1_value"));

        let needed = defender.defense;
        results.neededTip = "<br>Defense: " + needed + "+";

        if (weapon.ap > 0) {
            needed += weapon.ap;
            results.neededTip += "<br>AP +" + weapon.ap;
        }
        if (weaponHits[w].notes.includes("Unpredictable +1 to AP")) {
            needed++;
            results.neededTip += "<br>Unpredictable +1 to AP";
        }
        if (weaponHits[w].notes.includes("Versatile +1 to AP")) {
            needed++;
            results.neededTip += "<br>Versatile +1 to AP";
        }
        if (weaponHits[w].notes.includes("Thrust")) {
            needed++;
            results.neededTip += "<br>Thrust/Charge +1 to AP";
        }
        if (defenderTT.includes(TT.vDD) && weapon.keywords.includes("Unstoppable") === false) {
            needed--;
            results.neededTip += "<br>" + TT.vDD;
        }
        if ((defender.keywords.includes("Shielded") || defenderAuras.includes("Shielded")) && weapon.spell !== true) {
            needed--;
            results.neededTip += "<br>Shielded +1 Defense";
        }



        if (cover === 2 && weapon.type !== "CCW") {
            needed--;
            results.neededTip += "<br>Hard Cover -1";
        }

        results.needed = Math.min(6,Math.max(2,needed));



        if (weapon.name === "Ravage") {
            results.needed = 7;
            results.neededTip = "<br>Ravage - no Save";
        }


        for (let i=0;i<hits;i++) {
            indivNeeded = needed; //so rending can modify the base
            if (i < crits && weapon.keywords.includes("Rending")) {
                indivNeeded += 4;
                results.rending++;
            }

            indivNeeded = Math.min(6,Math.max(2,indivNeeded));

            if (weapon.name === "Ravage") {
                indivNeeded = 7;
            }

            
            let defenseRoll = randomInteger(6);
            
            if (defenseRoll === 6 && weapon.keywords.includes("Bane")) {
                roll = randomInteger(6);
                results.bane++;
            }

            results.rolls.push(defenseRoll);

            if (defenseRoll < indivNeeded) {
                let wounds = 1;
                if (defenseRoll === 1 && weapon.keywords.includes("Slam")) {
                    wounds++;
                    results.slam++;
                }
                if (i < crits && weapon.keywords.includes("Rupture")) {
                    wounds++;
                    results.rupture++;
                }

                if (deadly > 0) {
                    max = hp - (Math.floor(hp/defender.toughness) * defender.toughness);
                    if (max === 0) {
                        max = defender.toughness;
                    }
                    wounds = Math.min(deadly,max);
                    results.deadlyTip += "<br>Deadly = " + wounds + " Wounds";
                }


                //add in any auras that would otherwise be recognized as keywords
                let keywords = DeepCopy(defender.keywords);
                if (defenderAuras.includes("Resistance")) {
                    keywords.push("Resistance");
                }

                //Ignore Wound abilities
                let ignoreReasons = [{reason: "Plaguebound", target: 6, verb: " ignored "},{reason: "Protected", target: 6, verb: " ignored "},{reason: "Resistance", target: 6, spellTarget: 2, verb: " ignored "}];
                

                for (let i=0;i<ignoreReasons.length;i++) {
                    if (keywords.includes(ignoreReasons[i].reason)) {
                        let reason = ignoreReasons[i].reason;
                        let ignore = 0;
                        let ignoreRolls = [];
                        let target = (weapon.spell === true && ignoreReasons[i].spellTarget) ? ignoreReasons[i].spellTarget : ignoreReasons[i].target;

                        if (reason === "Plaguebound" && defenderAuras.includes("Plaguebound Boost")) {
                            target--;
                            reason = "Plaguebound + Boost";
                        }
                        for (let i=0;i<wounds;i++) {
                            let roll = randomInteger(6);
                            ignoreRolls.push(roll);
                            if (roll >= target) {
                                ignore++;
                            }
                        }
                        ignore = Math.min(wounds,ignore);
                        wounds = wounds - ignore;
                        let index = results.reduce.findIndex(reduce => reduce.reason === reason);
                        if (index > -1) {
                            results.reduce[index].rolls = results.reduce[index].rolls.concat(ignoreRolls);
                            results.reduce[index].wounds += ignore;
                        } else {
                            let igresult = {
                                reason: reason,
                                target: target,
                                rolls: ignoreRolls,
                                wounds: ignore,
                                verb: ignoreReasons[i].verb,
                            }
                            results.reduce.push(igresult);
                        }
                    }
                }

                //Regen Abilities, disabled by Bane, Unstoppable
                denyRegen = ["Unstoppable","Bane","Rupture","Butcher"];


                if (wounds > 0 && weapon.keywords.some((e) => denyRegen.includes(e)) === false) {
                    let rtarget = 5;

                    if (keywords.includes("Regeneration")) {
                        let regen = 0;
                        let regenRolls = [];
                        for (let i=0;i<wounds;i++) {
                            let roll = randomInteger(6);
                            regenRolls.push(roll);
                            if (roll >= rtarget) {
                                regen++;
                            }

                        }
                        regen = Math.min(wounds,regen);
                        wounds = wounds - regen;
                        let index = results.reduce.findIndex(reduce => reduce.reason === "Regeneration");
                        if (index > -1) {
                            results.reduce[index].rolls = results.reduce[index].rolls.concat(regenRolls);
                            results.reduce[index].wounds += regen;
                        } else {
                            let igresult = {
                                reason: "Regeneration",
                                target: rtarget,
                                rolls: regenRolls,
                                wounds: regen,
                                verb: " removes ",
                            }
                            results.reduce.push(igresult);
                        }
                    }
                    
                }

                unitWounds += wounds;
                
                if (unitWounds >= hp) {
                    totalWounds += unitWounds;
                    //defender is dead, check if another to apply next hit(s) to, or stop if none
                    results.wounds = unitWounds;
                    WeaponOutput(results);
                    if (defenders.length > 1) {
                        currentDefender = 1;
                    } else {
                        //end weapons/hits, no other living units
                        active = false;
                        break weaponLoop;
                    }
                } 
                //continue to next hit as unit still alive
            } else {
                results.saves++;
            }

        }
        //next weapon, unit still alive
        results.wounds = unitWounds;
        WeaponOutput(results);
        totalWounds += unitWounds;
    }
    //end hits


    for (let i=0;i<output.length;i++) {
        outputCard.body.push(output[i]);
    }

    let res = {
        totalWounds: totalWounds,
        active: active,
    }


    return res;

}







    const ZeroResults = () => {
        //zeros the results and creates the array
        results = {
            rolls: [],
            wounds: 0,
            saves: 0,
            deadlyTip: "",
            bane: 0,
            rending: 0,
            slam: 0,
            rupture: 0,
            needed: 6,
            neededTip: "",
            reduce: [],
            destroyed: false,
            defender: "",
        }
        return results;
    }




    const changeGraphic = (tok,prev) => {
        let unit = UnitArray[tok.get("id")];
        if (!unit) {return};
        //rotate token to match direction of movement and mark moved
        if (state.GDF3.turn > 0) {
            if (tok.get("left") !== prev.left || tok.get("top") !== prev.top) {
                let tokPt = new Point(tok.get("left"),tok.get("top"));
                let tokCube = tokPt.toCube();
                let tokLabel = tokCube.label();
                let prevPt = new Point(prev.left,prev.top);
                let prevCube = prevPt.toCube();
                let prevLabel = prevCube.label();
                if (tokLabel !== prevLabel) {
                    unit.moved = true;
                    log(unit.name + " moved");
                    let angle = prevCube.angle(tokCube);
                    if (unit.type !== "Aircraft") {
                        let angle = prevCube.angle(tokCube);
                        tok.set("rotation",angle);
                    }
                }
            }
        }



    }







    const addGraphic = (obj) => {
        let unit = new Unit(obj);
        unit.token.set({
            bar1_value: unit.woundsMax,
            bar1_max: unit.woundsMax,
            showplayers_bar1: true,
            aura1_color: "#00ff00",
            aura1_radius: 0.05,
            showplayers_aura1: true,
            tooltip: "",
            show_tooltip: true,
            showplayers_tooltip: true,
            showplayers_name: true,
            statusmarkers: "",
        })



    }
    
    const destroyGraphic = (obj) => {
        let name = obj.get("name");
        log(name + " Destroyed")
        let unit = UnitArray[obj.get("id")];
        if (unit) {
            delete UnitArray[unit.tokenID];
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
                log(state.GDF3);
                log("Units");
                log(UnitArray)
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!AddAbilities':
                AddAbilities(msg);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
                break;
            case '!Roll':
                RollDice(msg);
                break;
            case '!Attack':
                Attack(msg);
                break;
            case '!Activate':
                Activate(msg);
                break;
            case '!Morale':
                Morale(msg);
                break;
            case '!SetTT':
                SetTT(msg);
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
        log("===> Epic Grimdark Future <===");
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


