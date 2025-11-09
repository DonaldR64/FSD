const Warpath = (() => {
    const version = '2025.11.8';
    if (!state.Warpath) {state.Warpath = {}};

    const pageInfo = {};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    const UnitMarkers = ["A::6001458","B::6001459","C::6001460","D::6001461","E::6001462","F::6001463","G::6001464","H::6001465","I::6001466","J::6001467","L::6001468","M::6001469","O::6001471","P::6001472","Q::6001473","R::6001474","S::6001475"];

    const TurnMarkers = ["","https://s3.amazonaws.com/files.d20.io/images/361055772/zDURNn_0bbTWmOVrwJc6YQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055766/UZPeb6ZiiUImrZoAS58gvQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055764/yXwGQcriDAP8FpzxvjqzTg/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055768/7GFjIsnNuIBLrW_p65bjNQ/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055770/2WlTnUslDk0hpwr8zpZIOg/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055771/P9DmGozXmdPuv4SWq6uDvw/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055765/V5oPsriRTHJQ7w3hHRBA3A/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055767/EOXU3ujXJz-NleWX33rcgA/thumb.png?1695998303","https://s3.amazonaws.com/files.d20.io/images/361055769/925-C7XAEcQCOUVN1m1uvQ/thumb.png?1695998303"];




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

    let ModelArray = {};
    let UnitArray = {};
    let PlayerInfo = {};
    let currentUnitID = "";

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
        "Marauders": {
            "image": "",
            "backgroundColour": "#00ff00",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#00ff00",
            "borderStyle": "5px groove",

        },
        "Enforcers": {
            "image": "",
            "backgroundColour": "#ffffff",
            "titlefont": "Bokor",
            "fontColour": "#0000ff",
            "borderColour": "#0000ff",
            "borderStyle": "5px double",
        },

        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
        },

    };


    const SM = {
       hover: "status_brown",
    }


    //height is height of terrain element
    //Hills will be elevations lines - height 3 per elevation
    //move: Open, Difficult, Impassable
    //move arrays are: Infantry + Heavy Infantry / Bike / Walker / Vehicle / Super-Heavy
    //cover - ignore wall adjacent for firing unit 
    //woods LOS Is 2 hexes in, ignore edge hex for cover firing out


    const LinearTerrain = {
        "#00ff00": {name: "Hedge",height: 1,move: {Infantry: "Open","Heavy Infantry": "Open", Bike: "Difficult", Walker: "Difficult", Vehicle: "Difficult", "Super-Heavy": "Open"},cover: {Infantry: true,"Heavy Infantry": true,Bike: true, Walker: true, Vehicle: true, "Super-Heavy": false}},
       "#980000": {name: "Wall",height: 1,move: {Infantry: "Open","Heavy Infantry": "Open",Bike: "Difficult", Walker: "Difficult", Vehicle: "Difficult", "Super-Heavy": "Open"},cover: {Infantry: true,"Heavy Infantry": true, Bike: true, Walker: true, Vehicle: true, "Super-Heavy": false}},
        "#ff0000 Wall": {name: "High Wall",height: 2,move: {Infantry: "Difficult","Heavy Infantry": "Difficult", Bike: "Impassable", Walker: "Difficult", Vehicle: "Impassable", "Super-Heavy": "Open"},cover: {Infantry: true,"Heavy Infantry": true, Bike: true, Walker: true, Vehicle: true, "Super-Heavy": false}},



    }





    const TerrainInfo = {
        "Woods": {name: "Woods",height: 4,move: {Infantry: "Open","Heavy Infantry": "Open", Bike: "Difficult", Walker: "Difficult", Vehicle: "Difficult", "Super-Heavy": "Difficult"},cover:  {Infantry: true,"Heavy Infantry": true, Bike: true, Walker: true, Vehicle: true, "Super-Heavy": true}},
        "Craters": {name: "Craters",height: 0,move: {Infantry: "Open","Heavy Infantry": "Open", Bike: "Difficult", Walker: "Open", Vehicle: "Open", "Super-Heavy": "Open"}, cover: {Infantry: true,"Heavy Infantry": true, Bike: true, Walker: true, Vehicle: false, "Super-Heavy": false}},
        "Rubble": {name: "Rubble",height: 0,move: {Infantry: "Open","Heavy Infantry": "Open", Bike: "Difficult", Walker: "Open", Vehicle: "Open", "Super-Heavy": "Open"}, cover: {Infantry: true,"Heavy Infantry": true, Bike: true, Walker: true, Vehicle: false, "Super-Heavy": false}},
        "Broken Ground": {name: "Broken Ground",height: 0,move: {Infantry: "Open","Heavy Infantry": "Open", Bike: "Difficult", Walker: "Open", Vehicle: "Open", "Super-Heavy": "Open"}, cover: {Infantry: true,"Heavy Infantry": true, Bike: true, Walker: true, Vehicle: false, "Super-Heavy": false}},
        "Low Building": {name: "Low Building",height: 4,move: {Infantry: "Open","Heavy Infantry": "Open", Bike: "Impassable", Walker: "Open", Vehicle: "Impassable", "Super-Heavy": "Impassable"}, cover: {Infantry: true,"Heavy Infantry": true, Bike: false, Walker: false, Vehicle: false, "Super-Heavy": false}},
        "Med Building": {name: "Med Building",height: 6,move: {Infantry: "Open","Heavy Infantry": "Open", Bike: "Impassable", Walker: "Open", Vehicle: "Impassable", "Super-Heavy": "Impassable"},cover: {Infantry: true,"Heavy Infantry": true, Bike: false, Walker: false, Vehicle: false, "Super-Heavy": false}},
        "Tall Building": {name: "Tall Building",height: 8,move: {Infantry: "Open","Heavy Infantry": "Open", Bike: "Impassable", Walker: "Open", Vehicle: "Impassable", "Super-Heavy": "Impassable"},cover: {Infantry: true,"Heavy Infantry": true, Bike: false, Walker: false, Vehicle: false, "Super-Heavy": false}},
        "River": {name: "River",height: 0, move: {Infantry: "Difficult","Heavy Infantry": "Difficult", Bike: "Impassable", Walker: "Difficult", Vehicle: "Impassable", "Super-Heavy": "Difficult"},cover: {Infantry: true,"Heavy Infantry": true, Bike: false, Walker: false, Vehicle: false, "Super-Heavy": false}},
        "Ruins": {name: "Ruins", height: 4,move: {Infantry: "Open","Heavy Infantry": "Open", Bike: "Impassable", Walker: "Open", Vehicle: "Impassable", "Super-Heavy": "Impassable"},cover: {Infantry: true,"Heavy Infantry": true, Bike: true, Walker: true, Vehicle: true, "Super-Heavy": false}},
        "Open": {name: "Open Ground", height: 0,move: {Infantry: "Open","Heavy Infantry": "Open", Bike: "Open", Walker: "Open", Vehicle: "Open", "Super-Heavy": "Open"},cover: {Infantry: false,"Heavy Infantry": false, Bike: false, Walker: false, Vehicle: false, "Super-Heavy": false}},



    }

    const HillHeights = {
        //each level has a height of 3
        "#000000": 3,
        "#666666": 6,
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


    const KeyNum = (model,keyword) => {
        let key = model.keywords.split(",");
        log(key)
        let num = 1;
        _.each(key,word => {
            if (word.includes(keyword)) {
                word = word.trim().replace(keyword,"").replace("(","").replace(")","");
                num = parseInt(word);
            }
            log(num)
        })
        return num;
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
            //returns array of hexes between this hex and hex 'b' incl. hex 'b'
            var N = this.distance(b);
            var a_nudge = new Cube(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
            var b_nudge = new Cube(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 1; i <= N; i++) {
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
            this.terrain = "Open";
            this.edges = {};
            _.each(DIRECTIONS,a => {
                this.edges[a] = "Open";
            })
            HexMap[this.label] = this;
        }
    }

    class Model {
        constructor(id) {
            let token = findObjs({_type:"graphic", id: id})[0];
            let label = (new Point(token.get("left"),token.get("top"))).label();
            let charID = token.get("represents");
            let char = getObj("character", charID); 

            let aa = AttributeArray(charID);
  

            this.token = token;
            this.charName = char.get("name");
            let name = token.get("name");
            if (!name || name === "") {
                name = this.charName;
            }
            this.name = name;

            this.id = id;
            this.charID = charID;
            this.hexLabel = label;

            this.faction = aa.faction || "Neutral";
            if (state.Warpath.factions[0] === "") {
                state.Warpath.factions[0] = this.faction;
            } else if (state.Warpath.factions[0] !== this.faction && state.Warpath.factions[1] === "") {
                state.Warpath.factions[1] = this.faction;
            }
            this.player = (this.faction === "Neutral") ? 2:(state.Warpath.factions[0] === this.faction)? 0:1;
            this.keywords = aa.unitkey || " ";
            this.bases = parseInt(aa.bases);
            this.type = aa.type;
            this.height = parseInt(aa.height);
            this.speed = aa.speed.split("/").map(e => {return parseInt(e)}) || [0,0];
            this.unitStrength = aa.us.split("/").map(e => {return parseInt(e)}) || [1,1];
            this.shoot = parseInt(aa.shoot) || 0;
            this.assault = parseInt(aa.assault) || 0;
            this.armour = parseInt(aa.armour) || 0;
            this.save = parseInt(aa.save) || 0;
            
            this.unitID = "";



            let weapons = [];
            for (let i=0;i<5;i++) {
                let w=i+1;
                let prefix = "weapon" + w;
                let wname = aa[prefix + "name"];
                let wequip = aa[prefix + "equipped"];
                if (!wequip || wequip === undefined || wequip === "Off") {continue};
                if (!wname || wname === undefined || wname === null) {continue};

                let wrange = aa[prefix + "range"];
                if (wrange !== "A") {
                    wrange = parseInt(wrange);
                }
                
                let watt = aa[prefix + "attack"];
                watt = parseInt(watt);

                let weapon = {
                    name: wname,
                    range: wrange,
                    attack: watt,
                    keywords: aa[prefix + "keywords"],
                    fx: aa[prefix + "fx"],
                    sound: aa[prefix + "sound"],
                }
                weapons.push(weapon);
            }
            this.weapons = weapons;





            ModelArray[id] = this;
            HexMap[label].tokenIDs.push(id);






        }



        Destroyed () {
            

        }













    }

    class Unit {
        constructor(mID,uID) {
            let refModel = ModelArray[mID];
            this.faction = refModel.faction;
            this.player = refModel.player;
            this.bases = refModel.bases;
            this.type = refModel.type;
            if (!uID) {
                uID = stringGen();
            }
            this.id = uID;
            this.tokenIDs = [];
            this.symbol = "";
            UnitArray[uID] = this;
        }

        AddModel(mID) {
            this.tokenIDs.push(mID);
            ModelArray[mID].unitID = this.id;
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
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return};
        AddAbilities2(unit);
    }


    const AddAbilities2 = (unit) => {
        let char = getObj("character", unit.charID);   

        let abilityName,action;
        let abilArray = findObjs({_type: "ability", _characterid: char.id});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        //Move 
        if (unit.moveMax > 0) {
            abilityName = "0 - Move";
            action = "!Activate;Move;@{selected|token_id}";
            AddAbility(abilityName,action,char.id);
        }

        let systemNum = 0;
        //Use Weapons 
        for (let i=0;i<unit.weapons.length;i++) {
            let weapon = unit.weapons[i];
            systemNum++;
            abilityName = systemNum + " - " + weapon.name;
            action = "!Activate;Attack" + i + ";@{selected|token_id}";
            //how many targets?
            let targets = 1;
            if (weapon.name.includes("(x")) {
                let temp = weapon.name.split("(x");
                targets = parseInt(temp[1].replace(")",""));
            }
            for (let t=0;t<targets;t++) {
                action += ";@{target|Target " + (t+1) + "|token_id}";
            }
            AddAbility(abilityName,action,char.id);
        }

        //Use Abilities

        


        //Load Weapons/Abilities





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
        AddElevations();
        AddTerrain();    
        //AddEdges();
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
                let unitID = decodeURIComponent(token.get("gmnotes")).toString();       
                let model = new Model(token.id);
                if (unitID) {
                    let unit = UnitArray[unitID];         
                    if (!unit) {
                        unit = new Unit(token.id,unitID);
                    }
                    unit.AddModel(token.id);
                }
            }  



        });
        let elapsed = Date.now()-start;
        log(`${c} token${s} checked in ${elapsed/1000} seconds - ` + Object.keys(ModelArray).length + " placed in Model Array");

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



    const TokenInfo = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let model = ModelArray[id];
        if (!model) {return};
        SetupCard(model.name,"",model.faction);
        let hex = HexMap[model.hexLabel];
        let terInfo = TerrainInfo[hex.terrain];
        outputCard.body.push("Hex: " + model.hexLabel);
        outputCard.body.push("Terrain: " + hex.terrain);
        outputCard.body.push("Elevation: " + hex.elevation);
        outputCard.body.push("Height of Terrain: " + terInfo.height);
        outputCard.body.push("Height of Base: " + model.height);
        outputCard.body.push("Movement: " + terInfo.move[model.type]);
        outputCard.body.push("Cover: " + terInfo.cover[model.type]);


        for (let i=0;i<6;i++) {
            let edge = hex.edges[DIRECTIONS[i]];
            if (edge !== "Open") {
                outputCard.body.push(edge.name + " on " + DIRECTIONS[i] + " Edge");
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


    const RollDice = (msg) => {
        PlaySound("Dice");
        let roll = randomInteger(8);
        let playerID = msg.playerid;
        let id,model,player;
        if (msg.selected) {
            id = msg.selected[0]._id;
        }
        let faction = "Neutral";

        if (!id && !playerID) {
            log("Back")
            return;
        }
        if (id) {
            model = ModelArray[id];
            if (model) {
                faction = model.faction;
                player = model.player;
            }
        }
        if ((!id || !model) && playerID) {
            faction = state.Warpath.players[playerID];
            player = (state.Warpath.factions[0] === faction) ? 0:1;
        }

        if (!state.Warpath.players[playerID] || state.Warpath.players[playerID] === undefined) {
            if (faction !== "Neutral") {    
                state.Warpath.players[playerID] = faction;
            } else {
                sendChat("","Click on one of your tokens then select Roll again");
                return;
            }
        } 
        let res = "/direct " + DisplayDice(roll,faction,40);
        sendChat("player|" + playerID,res);
    }






    const ClearState = (msg) => {
        LoadPage();
        BuildMap();

        //clear arrays
        ModelArray = {};
        UnitArray = {};
        //clear token info
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        })
        tokens.forEach((token) => {
            if (token.get("name").includes("Objective") === true) {return};
            token.set({
                name: "",
                tint_color: "transparent",
                aura1_color: "transparent",
                aura1_radius: 0,
                showplayers_bar1: false,
                showplayers_bar2: false,
                showplayers_bar3: false,
                showname: true,
                showplayers_aura1: true,
                gmnotes: "",
                statusmarkers: "",
                tooltip: "",
            });                
        });
    
        RemoveDead("All");

        state.Warpath = {
            playerIDs: ["",""],
            players: {},
            factions: ["",""],
            markers: [[],[]],
            lines: [],
            turn: 0,
            deployLines: [],
        }

        for (let i=0;i<UnitMarkers.length;i++) {
            state.Warpath.markers[0].push(i);
            state.Warpath.markers[1].push(i);
        }

        sendChat("","Cleared State/Arrays");
    }


    const RemoveDepLines = () => {
        for (let i=0;i<state.Warpath.deployLines.length;i++) {
            let id = state.Warpath.deployLines[i];
            let path = findObjs({_type: "path", id: id})[0];
            if (path) {
                path.remove();
            }
        }
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

    const UnitCreation = (msg) => {
        if (!msg.selected) {
            sendChat("","No Tokens Selected");
            return
        }
        let tokenIDs = [];
        let model,unit,markerNumber;
        for (let i=0;i<msg.selected.length;i++) {
            mID = msg.selected[i]._id;
            model = new Model(mID);
            let name = model.name;
            if (msg.selected.length > 1) {
                name = model.name + " " + (i+1);
            }
            if (i===0) {
                markerNumber = randomInteger(state.Warpath.markers[model.player].length - 1) || 1;
                unit = new Unit(mID);
                unit.symbol = UnitMarkers[markerNumber];
            }
            tokenIDs.push(mID);
            model.token.set({
                tint_color: "transparent",
                gmnotes: unit.id,
                name: name,
                tint_color: "transparent",
                aura1_color: "transparent",
                aura1_radius: 0,
                showplayers_bar1: false,
                showplayers_bar2: false,
                showplayers_bar3: false,
                showname: true,
                showplayers_aura1: true,
                statusmarkers: "",
                tooltip: "",
            })
            model.token.set("status_" + unit.symbol,true);
            if (model.keywords.includes("Resilience")) {
                let resilience = KeyNum(model,"Resilience") || 1;
                model.token.set({
                    showplayers_bar1: false,
                    bar1_value: resilience,
                    bar1_max: resilience,
                })
            } 




        }
        unit.tokenIDs = tokenIDs;
        sendChat("","Unit of " + model.name + " Added")
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
        let shooter = ModelArray[shooterID];
        if (!shooter) {
            sendChat("","Not valid shooter");
            return;
        }
        let target = ModelArray[targetID];
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
        let shooterUnit = UnitArray[shooter.unitID];
        let targetUnit = UnitArray[target.unitID];

        if (!weapon) {
            weapon = {keywords: " "};
        }
        let los = true;
        let losReason = "";
        let losBlock = "";
        let cover = false;

        let shooterHex = HexMap[shooter.hexLabel];
        let targetHex = HexMap[target.hexLabel];
        let distance = shooterHex.cube.distance(targetHex.cube) - 1;
        
        //firing arc on weapon - used on fliers
        let angle = TargetAngle(shooter,target);
        let facing = "Front";
        if (shooter.keywords.includes("Fly") && shooter.token.get(SM.hover) === false) {
            if (angle > 90 && angle < 270) {
                facing = "Rear";
            }
        }

        let shooterElevation = shooterHex.elevation + shooter.height;
        let targetElevation = targetHex.elevation + target.height;

        //Fliers are above terrain 
        if (shooter.keywords.includes("Fly")) {
            if (shooter.token.get(SM.hover) === true) {
                shooterElevation += 3;
            } else {
                shooterElevation += 5;
            }
            shooterElevation += TerrainInfo[shooterHex.terrain].height;
        }
        if (target.keywords.includes("Fly")) {
            if (target.token.get(SM.hover) === true) {
                targetElevation += 3;
            } else {
                targetElevation += 5;
            }
            targetElevation += TerrainInfo[shooterHex.terrain].height;
        }

        let interCubes = shooterHex.cube.linedraw(targetHex.cube)
        let woods = 0;
        if (shooterHex.terrain === "Woods" && shooter.height <= 4 && shooter.keywords.includes("Fly") === false) {
            woods = 1;
        }

        for (let i=0;i<interCubes.length - 1;i++) {
            let label = interCubes[i].label();
log(label)
            let interHex = HexMap[label];
            let teH = TerrainInfo[interHex.terrain].height; //terrain in hex
            let edH = 0; //height of any terrain on edge crossed
//edge
/*
            let delta = interCubes[i].add(interCubes[i+1]);
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
                edH = LinearTerrain[edge].height;
            }
*/

            //check for intervening models
            let mHeight = 0;
            for (let t=0;t<interHex.tokenIDs.length;t++) {
                let tid = interHex.tokenIDs[t];
                let tModel = ModelArray[tid];
                if (shooterUnit.tokenIDs.includes(tid) || targetUnit.tokenIDs.includes(tid)) {
                    continue;
                }
                if (tModel.keywords.includes("Fly")) {
                    continue;
                }
                mHeight = Math.max(tModel.height,mHeight);
            }
log("terrain height: " + teH)
log("edge height: " + edH)
log("model height: " + mHeight)


            let iH = Math.max(teH,edH,mHeight);
            let modelBlock = false;
            if (mHeight === iH && mHeight > 0) {
                modelBlock = true;
            }
            interHexHeight = iH + interHex.elevation;
log("interHexHeight: " + interHexHeight)
            let deltaS = shooterElevation - interHexHeight;
            let deltaT = targetElevation - interHexHeight;
log("deltaS: " + deltaS)
log("deltaT: " + deltaT)

            if (deltaT > 3 || deltaS > 3) {continue};

            if (deltaS > 0 && deltaT > 0 && iH > 0) {
                //The line passes over a Base or terrain feature that is lower than both target and shooter (e.g. firing over an intervening wall or shorter Unit).
                cover = true;
    log("Cover at " + label);
            }
            if (iH > 0 && ((deltaS > 0 && deltaT === 0) || (deltaS === 0 && deltaT > 0))) {
                //The line passes over a Base or terrain feature that is equal in height to either the target or shooter, and lower than the other.
                cover = true;
    log("Cover at " + label);
            }

            if (deltaS <= 0 && deltaT <= 0) {
                if (modelBlock === true) {
                    los = false;
                    losBlock = label;
                    losReason = "Blocked by Model at " + label;
                    break;
                } else {
                    if (interHex.terrain === "Woods" && (shooterElevation >= interHex.elevation || targetElevation >= interHex.elevation)) { 
                        cover = true;
                        woods++;
    log("Woods at " + label);
                        if (woods > 2) {
                            los = false;
                            losBlock = label;
                            losReason = "Blocked by > 2 Hexes of Woods at " + label;
                            break;
                        }                    
                    } else {
                        los = false;
                        losBlock = label;
                        losReason = "Blocked by Terrain at " + label;
                        break;
                    }
                }
            }
        }

        //target hex
        if (TerrainInfo[targetHex.terrain].cover[target.type] === true) {
            cover = true;
log("Target Hex offers Cover")
        }
        if (targetHex.terrain === "Woods" && los === true) {
            woods++;
            if (woods > 2) {
                los = false;
                losBlock = targetHex.label;
                losReason = "Target is too deep in woods";
            }     
        }









        let result = {
            los: los,
            losReason: losReason,
            losBlock: losBlock,
            distance: distance,
            cover: cover,
        }


        return result;
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
        //RemoveLines();
        let model = ModelArray[tok.id];
        if (model) {
            let label = (new Point(tok.get("left"),tok.get("top"))).label();
            if (label !== model.hexLabel) {
                log(model.name + ' is moving from ' + model.hexLabel + ' to ' + label)
                let index = HexMap[model.hexLabel].tokenIDs.indexOf(model.id);
                if (index > -1) {
                    HexMap[model.hexLabel].tokenIDs.splice(index,1);
                }
                HexMap[label].tokenIDs.push(model.id);
                model.hexLabel = label;
                model.token.set({
                    left: HexMap[label].centre.x,
                    top: HexMap[label].centre.y,
                })
            }
        }



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
                log(state.Warpath);
                log("Models");
                log(ModelArray);
                log("Units");
                log(UnitArray)
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
            case '!UnitCreation':
                UnitCreation(msg);
                break;
            case '!Roll':
                RollDice(msg);
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
        log("===> Epic Warpath <===");
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


