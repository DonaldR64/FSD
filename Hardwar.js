const CC = (() => {
    const version = '2025.7.26';
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
        "alert": "status_blue", //temp ?



    }





    //height is height of terrain element
    //elevation is 0 by default
    //traits pull out mobility or Los features

    const TerrainInfo = {
        "Woods": {name: "Woods",height: 2, traits: ["Difficult","Foliage","Flammable"]},
        "Burning Woods": {name: "Burning Woods",height: 3, traits: ["Dangerous","Smoke (sustained)"]},
        "Scrub": {name: "Scrub",height: 1, traits: ["Rough","Foliage","Flammable"]},
        "Burning Scrub": {name: "Burning Scrub",height: 2, traits: ["Dangerous","Smoke"]},

        "Building 1": {name: "Building", height: 1, traits: ["Building"]},

        "Rubble": {name: "Rubble",height: 0, traits: ["Rough"]},

        "Ruins": {name: "Ruins",height: 1, traits: ["Hazardous","Open Structure"]},


        "Hill 1": {name: "Hill 1",height: 0,elevation:1},
        "Hill 2": {name: "Hill 2",height: 0, elevation:2},
        "Hill 3": {name: "Hill 3",height: 0, elevation:3},

        "Water": {name: "Water",height: 0, traits: ["Hazardous","Water"]},


    }

    const EdgeInfo = {
        "Hedge": {name: "Hedge",height: 0, traits: ["Difficult","Foliage","Flammable"]},
        "Burning Hedge": {name: "Burning Hedge",height: 1, traits: ["Dangerous","Smoke"]},
        "Wall": {name: "Low Wall",height: 0, traits: ["Difficult"]},
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
            this.terrainheight = 0;
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
            this.hexLabel = label;

            this.faction = aa.faction || "Neutral";
            this.class = parseInt(aa.class);
            this.type = aa.type;

            this.mobility = parseInt(aa.mobility) || 0;
            this.mobilityMax = parseInt(aa.mobility_max) || 0;
            this.firepower = parseInt(aa.fp) || 0;
            this.firepowerMax = parseInt(aa.fp_max) || 0;
            this.armour = parseInt(aa.armour) || 0;
            this.armourMax = parseInt(aa.armour_max) || 0;
            this.defence = parseInt(aa.defence) || 0;
            this.defenceMax = parseInt(aa.defence_max) || 0;

            this.weapons =  aa.weapons || "Cannon";
            this.abilities = aa.abilities || " ";

            UnitArray[id] = this;
            HexMap[label].tokenIDs.push(id);






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
                hex.terrainheight = Math.max(hex.elevation + terrain.height, hex.terrainheight);
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
            let types = {"#0000ff": "Stream","#000000": "Bridge","#00ff00": "Hedge"};
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
                        interHex.traits.push("Road");
                        interHex.terrain.push("Road");
                    }
                })
                if (HexMap[cube1.label()].traits.includes("Road") === false) {
                    HexMap[cube1.label()].traits.push("Road");
                    HexMap[cube1.label()].terrain.push("Road");
                }
                if (HexMap[cube2.label()].traits.includes("Road") === false) {
                    HexMap[cube2.label()].traits.push("Road");
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




	summonToken = function(character,left,top,currentSide,size){
        if (!currentSide) {currentSide = 0};
        if (!size) {size = 70};
		character.get('defaulttoken',function(defaulttoken){
		    const dt = JSON.parse(defaulttoken);
            let img;
            if (dt.sides) {
                sides = dt.sides.split("|")
                img = sides[currentSide] || dt.imgsrc;
            } else {
                img = dt.imgsrc;
            }
            img = tokenImage(img);
			if(dt && img){
				dt.imgsrc=img;
				dt.left=left;
				dt.top=top;
				dt.pageid = pageInfo.page.get('id');
                dt.layer = "objects";
                dt.width = size;
                dt.height = size;
                dt.currentSide = currentSide;
                log(dt)
                let newToken = createObj("graphic", dt);
                newToken.set({
                    disableSnapping: true,
                    disableTokenMenu: true,
                })
                return newToken.get("id");
			} else {
				sendChat('','/w gm Cannot create token for <b>'+character.get('name')+'</b>');
			}
		});
	};


    const HexData = (msg) => {
        let id = msg.selected[0]._id;
        if (!id) {return};
        let token = findObjs({_type:"graphic", id: id})[0];
        let point = new Point(token.get("left"),token.get("top"));
        let label = point.label();
        let hex = HexMap[label];
        SetupCard("Info","","Neutral");
        outputCard.body.push("Terrain: " + hex.terrain);
        outputCard.body.push("Elevation: " + hex.elevation);
        outputCard.body.push("Terrain Height: " + hex.terrainheight);
        outputCard.body.push("Traits: " + hex.traits);
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
        }





        sendChat("","Cleared State/Arrays, rebuilt and shuffled Decks");
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
            //reset stats
            unit.firepower = unit.firepowerMax;
            unit.mobility = unit.mobilityMax;
            unit.armour = unit.armourMax;
            unit.defence = unit.defenceMax;
            //set hp and activations
            token.set({
                bar1_value: 2,//mayneed to change based on units activations
                bar1_max: "",
                bar3_value: (unit.class * 2), 
                bar3_max: (unit.class * 2),
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
        return
        if (state.Hardwar.turn === 0) {return};
        let name = obj.get("name");
        if (obj.get("width") !== prev.width || obj.get("height") !== prev.height) {
            obj.set({
                width: prev.width,
                height: prev.height,
            })
        }

    }

    const addGraphic = (obj) => {
        log(obj)
        RemoveLines();




    }
    
    const destroyGraphic = (obj) => {
        let name = obj.get("name");
        log(name + " Destroyed")


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

        let losResult = LOS(shooter,target);
//? indirect and such

        SetupCard(shooter.name,"LOS",shooter.faction);
        outputCard.body.push("Distance: " + losResult.distance);
        if (losResult.los === false) {
            outputCard.body.push(losResult.losReason);
        } else if (losResult.los === true && losResult.lof === false) {
            outputCard.body.push("In LOS but Out of Arc of Fire");
        } else if (losResult.los === true && losResult.lof === true) {
            outputCard.body.push("In LOS and LOF");
            outputCard.body.push("Cover is " + losResult.cover);
            outputCard.body.push("Net Distance is " + (losResult.distance + losResult.cover));
        }
        PrintCard();
    }


    const LOS = (shooter,target,weapon) => {

        let los = true;
        let losReason = "";
        let lof = true;

        let cover = 0;
        let shooterHex = HexMap[shooter.hexLabel];
        let targetHex = HexMap[target.hexLabel];
        let distance = shooterHex.cube.distance(targetHex.cube);
        let angle = TargetAngle(shooter,target);
        let aov = 180;

        let aof = 180;
        if (shooter.type === "Air") {
            aof = 90;
        }
        if (shooter.abilities.includes("Alert") || shooter.token.get(SM.alert) === true) {
            aov = 360;
        }

//indirect and such
log("AOV: " + aov)
log("AOF: " + aof)
log("Angle: " + angle)

        if (angle > aov/2 && angle < (360-(aov/2))) {
            losReason = "Out of Arc of Vision";
            los = false;
        }
        if (angle > aof/2 && angle < (360-(aof/2))) {
            lof = false;
        }

        //check los now incl cover

        //for below ? unit heights themselves also?
        let pt1 = new Point(0,shooterHex.elevation);
        let pt2 = new Point(distance,targetHex.elevation);

        let interCubes = shooterHex.cube.linedraw(targetHex.cube);
        
        for (let i=1;i<interCubes.length;i++) {
            let interHex = HexMap[interCubes[i].label()];
            
            //smoke
            //terrain
            //units






        }






        let result = {
            los: los,
            losReason: losReason,
            lof: lof,
            distance: distance,
            angle: angle,
            cover: cover,
        }
        return result;
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
