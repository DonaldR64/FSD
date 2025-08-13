const WOTR = (() => {
    const version = '2025.5.23';
    if (!state.WOTR) {state.WOTR = {}};

    const FreeNations = ["Free People","The North","Gondor","Rohan","Dwarves","Elves",];

    const Characters = ["Aragorn","Gandalf the White","Saruman","The Witch-King","The Mouth of Sauron"];

    const CompanionList = ["Aragorn","Strider","Gandalf the White","Gandalf the Grey","Gimli","Legolas","Gollum","Peregrin Took","Meriadoc Brandybuck","Boromir"];

    const MapAreas = {};
    let DeckInfo = {};
    let PlayerHands = {};
    let PlayerInfo = {};
    let MasterCardList = {};
    let lastTileKey;

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



    const ActionDice = {
        "Free": {
            "Images": {
                0: "https://files.d20.io/images/440719133/ceJiew6mXclVyNcqsci9TA/thumb.png?1747073773",
                1: "https://files.d20.io/images/440719133/ceJiew6mXclVyNcqsci9TA/thumb.png?1747073773",
                2: "https://files.d20.io/images/440719135/L2wd7Sa4pLUsDBwZ6WyKwA/thumb.png?1747073773",
                3: "https://files.d20.io/images/440719134/s9Dfrti9AoOMxfaZuIJHVA/thumb.png?1747073773",
                4: "https://files.d20.io/images/440719132/OD2xj3iNSqBMNB9UsVfFqA/thumb.png?1747073773",
                5: "https://files.d20.io/images/440719131/guki2qnIezYKBPShWiI3jw/thumb.png?1747073773",
            },
            "Names": {
                0: "Character",
                1: "Character",
                2: "Event",
                3: "Muster",
                4: "Muster/Army",
                5: "Will of the West",
            }
        },
        "Shadow": {
            "Images": {
                0: "https://files.d20.io/images/440719140/hR4uRLDM7sllqcgYMC1Yfw/thumb.png",
                1: "https://files.d20.io/images/440719001/MzkXwi8eu-lBIoHxW3HD2w/thumb.png",
                2: "https://files.d20.io/images/440719035/8B8rN4clxj3HELbGmPiDkw/thumb.png",
                3: "https://files.d20.io/images/440719139/I8mVTVZsyH3u8G2XIHuibw/thumb.png",
                4: "https://files.d20.io/images/440719138/7D0rqSmer5uxzeuwJVL19A/thumb.png",
                5: "https://files.d20.io/images/440718806/XEhbzWgvQXEX6NYPyLvseQ/thumb.png",
            },
            "Names": {
                0: "Character",
                1: "Event",
                2: "Muster",
                3: "Muster/Army",
                4: "Army",
                5: "Eye",
            }
        }
    }
    
    const Tiles = {
        "Regular": {
            0: {
                "image":   "https://files.d20.io/images/440770286/WF1azXtpGoXDVvVciClyCg/thumb.png?1747102247",
                "damage": 0,
                "revealed": true,
                "type": "numbered",

            },
            1: {
                "image":   "https://files.d20.io/images/440770286/WF1azXtpGoXDVvVciClyCg/thumb.png?1747102247",
                "type": "numbered",
                 "damage": 0,
                "revealed": true,
            },
            2: {
                "image":   "https://files.d20.io/images/440770283/VR_LxnR5x9M6GH6RlynIFQ/thumb.png?1747102246",
                "type": "numbered",
                 "damage": 1,
                "revealed": true,
            },
            3: {
                "image":   "https://files.d20.io/images/440770283/VR_LxnR5x9M6GH6RlynIFQ/thumb.png?1747102246",
                "type": "numbered",
                 "damage": 1,
                "revealed": true,
            },
            4: {
                "image":   "https://files.d20.io/images/440770284/m6ArushyH9Md3GhsCR6bQQ/thumb.png?1747102246",
                "type": "numbered",
                 "damage": 1,
                "revealed": false,
            },
            5: {
                "image":   "https://files.d20.io/images/440770284/m6ArushyH9Md3GhsCR6bQQ/thumb.png?1747102246",
                "type": "numbered",
                 "damage": 1,
                "revealed": false,
            },
            6: {
                "image":   "https://files.d20.io/images/440770285/UbN21SG1DO60TImkPZhmuA/thumb.png?1747102246",
                "type": "numbered",
                 "damage": 3,
                "revealed": false,
            },
            7: {
                "image":   "https://files.d20.io/images/440770285/UbN21SG1DO60TImkPZhmuA/thumb.png?1747102246",
                "type": "numbered",
                 "damage": 3,
                "revealed": false,
            },
            8: {
                "image":   "https://files.d20.io/images/440770285/UbN21SG1DO60TImkPZhmuA/thumb.png?1747102246",
                "type": "numbered",
                 "damage": 3,
                "revealed": false,
            },
            9: {
                "image":   "https://files.d20.io/images/440770275/EMv_QUPjLpRCL7ZaBCRIEA/thumb.png?1747102243",
                "type": "eye",
                 "damage": 0,
                "revealed": true,
            },
            10: {
                "image":   "https://files.d20.io/images/440770275/EMv_QUPjLpRCL7ZaBCRIEA/thumb.png?1747102243",
                "type": "eye",
                 "damage": 0,
                "revealed": true,
            },
            11: {
                "image":   "https://files.d20.io/images/440770275/EMv_QUPjLpRCL7ZaBCRIEA/thumb.png?1747102243",
                "type": "eye",
                 "damage": 0,
                "revealed": true,
            },
            12: {
                "image":   "https://files.d20.io/images/440770275/EMv_QUPjLpRCL7ZaBCRIEA/thumb.png?1747102243",
                "type": "eye",
                 "damage": 0,
                "revealed": true,
            },
            13: {
                "image":   "https://files.d20.io/images/440770271/5GlMAdyEoJmit3nnU1gPkQ/thumb.png?1747102242",
                "type": "numbered",
                 "damage": 2,
                "revealed": true,
            },
            14: {
                "image":   "https://files.d20.io/images/440770269/SslWPyeMzwxA0FGQWNw3QQ/thumb.png?1747102241",
                "type": "numbered",
                 "damage": 2,
                "revealed": false,
            },
            15: {
                "image":   "https://files.d20.io/images/440770269/SslWPyeMzwxA0FGQWNw3QQ/thumb.png?1747102241",
                "type": "numbered",
                 "damage": 2,
                "revealed": false,
            },
        },
        "Special": {
            "Elven Cloaks": {
                "image":   "https://files.d20.io/images/440770270/7DiW-c2iBqgsbwNN44TlrQ/thumb.png?1747102241",
                "type": "fellowship special",
                 "damage": 0,
                "revealed": false,
                "stop": false,
            },
            "Elven Rope": {
                "image":   "https://files.d20.io/images/440770270/7DiW-c2iBqgsbwNN44TlrQ/thumb.png?1747102241",
                "type": "fellowship special",
                 "damage": 0,
                "revealed": false,
                "stop": false,
            },
            "Smeagol Helps Nice Master": {
                "image":   "https://files.d20.io/images/440770268/NWx6f-Z4cF3NSh_IA0fQyQ/thumb.png?1747102241",
                "type": "fellowship special",
                 "damage": -1,
                "revealed": false,
                "stop": false,
            },
            "Phial of Galadriel": {
                "image":   "https://files.d20.io/images/440770267/Icg8KivCqHjlLlAD_cin0w/thumb.png?1747102241",
                "type": "fellowship special",
                 "damage": -2,
                "revealed": false,
                "stop": false,
            },
            "Give it to Uss!": {
                "image":   "https://files.d20.io/images/440770276/sI7Bp_-kGo9i_5tAbGs27A/thumb.png?1747102244",
                "type": "shadow special",
                 "damage": 1,
                "revealed": true,
                "stop": true,
            },
            "On, On They Went": {
                "image":   "https://files.d20.io/images/440770277/cuxGobO_e-eyGQnqKJSrgA/thumb.png?1747102243",
                "type": "shadow special",
                 "damage": 3,
                "revealed": false,                
                "stop": true,
            },
            "The Ring is Mine!": {
                "image":   "https://files.d20.io/images/440770279/sqtdgAoEHgKrV5OzY3QEOQ/thumb.png?1747102244",
                "type": "shadow special,eye",
                 "damage": 0,
                "revealed": true,
                "stop": true,
            },
            "Shelob's Lair": {
                "image":   "https://files.d20.io/images/440770278/g6vOPCttHZgTY2Vw7GVlug/thumb.png?1747102243",
                "type": "shadow special",
                 "damage": 0,
                "revealed": false,
                "stop": true,
            },
        }
    }





    const diceWidth = 80; //pixels 

    const Sides = {
        "Free": {
            "image": "https://files.d20.io/images/441237392/QEp6R_cbQQvTgWyJxWKWnQ/thumb.png?1747446686",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#006400",
            "borderColour": "#006400",
            "borderStyle": "5px double",
        },
        "Shadow": {
             "image": "https://files.d20.io/images/441236992/X7NfQWKq8htAF6awQJuQZg/thumb.png?1747446478",
            "backgroundColour": "#FF0000",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#000000",
            "borderStyle": "5px groove",
        },
        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
        },
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


    const AddAbility = (abilityName,action,characterID) => {
        createObj("ability", {
            name: abilityName,
            characterid: characterID,
            action: action,
            istokenaction: true,
        })
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

        if (!outputCard.side || !Sides[outputCard.side]) {
            outputCard.side = "Neutral";
        }

        //start of card
        output += `<div style="display: table; border: ` + Sides[outputCard.side].borderStyle + " " + Sides[outputCard.side].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: center; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Sides[outputCard.side].backgroundColour + `; `;
        output += `background-image: url(` + Sides[outputCard.side].image + `), url(` + Sides[outputCard.side].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: center,center; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="`;
        output += `font-family: ` + Sides[outputCard.side].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Sides[outputCard.side].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Sides[outputCard.side].fontColour + `; `;
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
                    out += `<a style ="background-color: ` + Sides[outputCard.side].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Sides[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Sides[outputCard.side].borderColour + `; font-family: Tahoma; font-size: x-small; `;
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
                    if (Sides[fac]) {
                        lineBack = Sides[fac].backgroundColour;
                        fontcolour = Sides[fac].fontColour;
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
                let borderColour = Sides[outputCard.side].borderColour;
                
                if (inline === false || i===0) {
                    out += `<div style="display: table-row; background: #FFFFFF;; ">`;
                    out += `<div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                    out += `"><span style="line-height: normal; color: #000000; `;
                    out += `"> <div style='text-align: center; display:block;'>`;
                }
                if (inline === true) {
                    out += '<span>     </span>';
                }
                out += `<a style ="background-color: ` + Sides[outputCard.side].backgroundColour + `; padding: 5px;`
                out += `color: ` + Sides[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
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

    const BuildMap = () => {
        //define areas with lines
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});
        let types = {"#0000ff": "Free","#ff0000": "Shadow","#000000": "Shadow Hunt","#6aa84f": "Guide","#00ff00": "Companions","#ffffff": "Mount Doom","#434343": "Free Hunt"};

        _.each(paths,path => {
            let type = types[path.get("stroke").toLowerCase()];
            if (type) {
                let vertices = translatePoly(path);
                MapAreas[type] = {'vertices': vertices};
            }
        });







    }

    const RollAction = (msg) => {
        //!RollAction;?{Number of Dice|0}
        let playerID = msg.playerid;
        let side = state.WOTR.players[playerID];
        if (!side) {
            sendChat("","This Player has not yet picked a Side");
            return;
        }
        let totalDice = state.WOTR.dice[side];
        if (side === "Shadow") {
            //ask in chat re Hunt Dice
            SetupCard("Hunt Dice","","Shadow");
            let companionArray = TokensInArea("Companions",["Guide","Companions"]);
            let max = Math.max(companionArray.length,1);
            let phrase = "0 - " + max;
            ButtonInfo("Click to Choose Hunt Dice","!HuntDice;?{" + phrase + "|0};"+ totalDice + ";" + max);
            PrintCard();
        } else {
            RollAction2(side,totalDice)
        }     
    }

    const HuntDice = (msg) => {
        let Tag = msg.content.split(";");
        let huntDice = Tag[1];
        let totalDice = Tag[2];
        let max = Tag[3];
        huntDice = Math.min(huntDice,max);
        RollAction2("Shadow",totalDice,huntDice);
    }


    const RollAction2 = (side,totalDice,huntDice) => {
        ClearDice(side);
        PlaySound("Dice");
        SetupCard("Action Dice Roll",totalDice + " Dice",side);
        if (huntDice && huntDice > 0) {
            totalDice -= huntDice;
            //place hunt dice , set to eye, in shadow hunt map area
            PlaceDice(huntDice,"Shadow Hunt");
            outputCard.body.push(huntDice + " Dice Placed in Hunt Box before Roll");
            outputCard.body.push("[hr]")
        }
        PlaceDice(totalDice,side);
        PrintCard();
    }



    const MordorHunt = (tok) => {
        let x = tok.get("left");
        let y = tok.get("top");
        let area = MapAreas["Mount Doom"];
        if (x < area.vertices[0].x || x > area.vertices[1].x || y < area.vertices[0].y || y > area.vertices[1].y) {
            return;
        }
        SetupCard("Mordor!","","Free");
        outputCard.body.push("The Ringbearers have walked into Mordor");
        PrintCard();
        state.WOTR.Mordor = true;
        let newTiles = state.WOTR.huntTiles;
         //place back in any drawn eye tiles 9 - 12, unless were removed
        for (let i=9;i<13;i++) {
            if (newTiles.includes(i) === false && state.WOTR.removedTiles.includes(i) === false) {
                newTiles.push(i);
            }
        }
        //add in the special tiles, based on cards played and on the table
        let cards =  findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "card",layer: "objects",});
        let list = Object.keys(Tiles.Special);
        _.each(cards,card => {
            let cardid = card.get("cardid");
            let cardInfo = MasterCardList[cardid]
            log(cardInfo)
            if (list.includes(cardInfo.name)) {
                newTiles.push(cardInfo.name);
            }
        })        
        state.WOTR.huntTiles = newTiles;
        //any special tiles drawn now captured in addGrpahic
    }




    const PlaceDice = (numDice,area) => {
        //using the vertices of the area, divide the area up and place the dice
        //if is Shadow Hunt area then place an eye, otherwise roll # and place that #
        //organize them by type also
        let rolls = [0,0,0,0,0,0];
        let diceType = (area === "Shadow Hunt") ? "Shadow":area;
        for (let i=0;i<numDice;i++) {
            let roll = randomInteger(6);
            if (area === "Shadow Hunt") {
                roll = 6;
            }
            if (area === "Free" && roll === 2) {
                roll = 1;
            }
            rolls[roll - 1]++;
        }

        let vertices = MapAreas[area].vertices;
        let width = vertices[1].x - vertices[0].x;

        let halfDW = diceWidth * .5;

        let numX = Math.floor((width - halfDW)/(1.5 * diceWidth));
        let outside = Math.round((width - (diceWidth * numX) - (halfDW * (numX -1)))/2);
        let startX = vertices[0].x + outside + halfDW;
        let posY = vertices[0].y + outside + halfDW;
        let lastX = vertices[1].x - outside;
        let huntDice = TokensInArea("Hunt Dice","Shadow Hunt").length;

        for (let roll = 0;roll<6;roll++) {
            let number = rolls[roll];
            if (number === 0) {continue};
            if (roll === 5 && diceType === "Shadow" && area === "Shadow") {
                vertices = MapAreas["Shadow Hunt"].vertices;
                width = vertices[1].x - vertices[0].x;
                numX = Math.floor((width - halfDW)/(1.5 * diceWidth));
                outside = Math.round((width - (diceWidth * numX) - (halfDW * (numX -1)))/2);
                startX = vertices[0].x + outside + halfDW;
                posY = vertices[0].y + outside + halfDW + (diceWidth * 1.5);
                let row = Math.floor(huntDice/numX);
                if (row > 0) {
                    posY += (row * diceWidth * 1.5);
                } 
                lastX = vertices[1].x - outside;
                huntDice += parseInt(number);
                outputCard.body.push(DisplayDice(6,diceType,36) + " " + ActionDice[diceType]["Names"][5] + ": " + huntDice + " Dice Total");
            } else if (area !== "Shadow Hunt") {
                outputCard.body.push(DisplayDice(roll+1,diceType,36) + " " + ActionDice[diceType]["Names"][roll] + ": " + number + " Dice");
            }


            let posX = startX;
            for (let i=0;i<number;i++) {
                CreateDice(roll,diceType,posX,posY);
                posX += (diceWidth * 1.5);
                if (posX > lastX) {
                    posX = startX;
                    posY += (diceWidth * 1.5);
                }
            }
            posY += (diceWidth * 1.5);
        }
    }


    const Hunt = (msg) => {
        let dice = TokensInArea("Hunt Dice","Shadow Hunt").length;
        dice = Math.min(dice,5);//max of 5 dice
        let max = dice;
        let numberSuccesses = 0;
        let rerolls = true;
        let Tag = msg.content.split(";");
        let freehunt = TokensInArea("Free Dice","Free Hunt").length;
        if (Tag.length > 1) {
            dice = parseInt(Tag[1]);
            max = parseInt(Tag[2]);
            numberSuccesses = parseInt(Tag[3]);
            rerolls = false;
        } 
        let needed = 6-freehunt;
        if (state.WOTR.CardsInPlay.includes("Flocks of Crebain")) {
            needed--;
        }
        needed = Math.max(2,needed);//1 is always a failure

        SetupCard("Hunt for the Ringbearers","Target = " + needed + "+","Shadow");
        let rolls = [];
        for (let i=0;i<dice;i++) {
            let roll = randomInteger(6);
            rolls.push(roll);
            if (roll >= needed) {numberSuccesses++};
        }
        rolls.sort();
        let out = [];
        _.each(rolls,roll => {
            out.push(DisplayDice(roll,"ShadowAttack",36));
        })
        out = out.toString();
        outputCard.body.push(out);
        PlaySound("Dice");
        if (rerolls === true) {
            ButtonInfo("Rerolls ?","!Hunt;?{# of Rerolls|0};" + dice + ";" + numberSuccesses);
        }
        if (numberSuccesses > 0) {
            outputCard.body.push("The Ringbearers are Found!");
            ButtonInfo("Draw a Hunt Tile","!DrawHuntTile;" + numberSuccesses)
        }
        if (state.WOTR.CardsInPlay.includes("Flocks of Crebain")) {
            outputCard.body.push("Remove Flocks of Crebain after any Rerolls");
        }
        PrintCard();
    }

    const TokensInArea = (type,areas) => {
        //find all tokens of a type in an array of areas
        //e.g. find all hunt dice in a hunt area
        //send back an array of same
        let array = [];
        if (Array.isArray(areas) === false) {
            areas = [areas];
        }
        _.each(areas,area => {
            let zone = MapAreas[area];
            let tokens = findObjs({_pageid:  Campaign().get("playerpageid") ,_type: "graphic"});
            _.each(tokens,token => {
                let name = token.get("name");
                let x = token.get("left");
                let y = token.get("top");
                if (x < zone.vertices[0].x || x > zone.vertices[1].x || y < zone.vertices[0].y || y > zone.vertices[1].y) {
                    return;
                };
                log(name)
                if (type === "Free Dice" && name === "Action Dice Free 0") {
                    array.push(name);
                }
                if (type === "Hunt Dice" && name === "Action Dice Shadow 5") {
                    array.push(name);
                }
                if (type === "Companions" && CompanionList.includes(name)) {
                    array.push(name);
                }

            })
        })
        return array;
    }







    const CreateDice = (roll,diceType,x,y) => {
        let img = getCleanImgSrc(ActionDice[diceType]["Images"][roll]);

        let newToken = createObj("graphic", {
            left: x,
            top: y,
            width: diceWidth,
            height: diceWidth, 
            name: "Action Dice " + diceType + " " + roll,
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: "objects",
            controlledby: "all",
        })

        if (newToken) {
            toFront(newToken);
        } 
        state.WOTR.diceIDs[diceType].push(newToken.id);
    }

    const ClearDice = (side) => {
        let ids = state.WOTR.diceIDs[side];
        _.each(ids,id => {
            let token = findObjs({_type:"graphic", id: id})[0];
            if (token) {
                token.remove();
            }
        })
        state.WOTR.diceIDs[side] = [];
    }




    const Flip = (msg) => {
        let id = msg.selected[0]._id;
        let token = findObjs({_type:"graphic", id: id})[0];
        let currentSide = token.get('currentSide');
        let tsides = token.get("sides");
        tsides = tsides.split("|");
        let sides = [];
        _.each(tsides,tside => {
            if (tside) {
                let side = tokenImage(tside);
                sides.push(side);
            }
        })        
        newSide = (currentSide === 0) ? 1:0;
        token.set({
            currentSide: newSide,
            imgsrc: sides[newSide],
        })
    }

    const BuildDecks = () => {
        DeckInfo = {};
        PlayerHands = {};
        MasterCardList = {};
        let decks = findObjs({_type: "deck"});
        let hands = findObjs({_type: "hand"});

        _.each(decks,deck => {
            let deckID = deck.get("id");
            let deckName = deck.get("name");
            if (deckName !== "Playing Cards") {
                let cardIDs = deck.get("currentDeck").split(",");
                let cards = {};
                _.each(cardIDs,cardID => {
                    let card = findObjs({_type: "card", id:cardID})[0];
                    let cardName = card.get("name");
                    cards[cardID] = cardName;
                    MasterCardList[cardID] = {
                        deckID: deckID,
                        deckName: deckName,
                        name: cardName,
                        id: cardID,
                    };
                })
                DeckInfo[deckName] = {
                    name: deckName,
                    id: deckID,
                    cards: cards,
                }



            }
        })
        _.each(hands,hand => {
            let handID = hand.get("id");
            let playerID = hand.get("parentid");
            PlayerHands[playerID] = handID;
        })



    }

    const ChooseCompanion = () => {
        let companions = TokensInArea("Companions",["Guide","Companions"])
        let roll = randomInteger(companions.length) - 1;
        let companion = companions[roll];
        if (companion === "Gollum") {
            companion = "(Gollum cannot be separated)";
        }
        SetupCard(companion,"","Free");
        PrintCard();
    }


    const DrawCard = (msg) => {
        let playerID = msg.playerid;
        let deckType = msg.content.split(";")[1];
        let side = state.WOTR.players[playerID];
        let deckName = side + " " + deckType;
        DrawCard2(playerID,deckName);
    }

    const DrawCard2 = (playerID,deckName) => {
        let deck = DeckInfo[deckName];  
        let cardID = drawCard(deck.id);
        log(cardID)
        if (cardID === false) {
            sendChat("",deckName + " Is Empty");
            return;
        }
        giveCardToPlayer(cardID, playerID);
    }





    const NewTurn = () => {
        state.WOTR.turn++;

        let playerIDs = Object.keys(state.WOTR.players);
        let deckTypes = [" Character"," Strategy"];
        //check that setup is complete
        let sides = [];
        let errorMsg = [];
        if (playerIDs.length === 0) {
            errorMsg.push("Players Must Choose Sides");
        }
        _.each(playerIDs,playerID => {
            let side = state.WOTR.players[playerID];
            if (!side) {
                errorMsg.push(PlayerInfo[playerID] + " must choose a Side");
            } else {
                sides.push(side);
            }
        })

        if (errorMsg.length > 0) {
            SetupCard("Complete Setup","","Neutral");
            _.each(errorMsg,error => {
                outputCard.body.push(error);
            })
        } else {
            _.each(playerIDs,playerID => {
                let side = state.WOTR.players[playerID];
                ClearDice(side);
                _.each(deckTypes,deckType => {
                    let deckName = side + deckType;
                    DrawCard2(playerID,deckName);
                });
            })
            SetupCard("Turn " + state.WOTR.turn,"","Neutral");
            outputCard.body.push("Fellowship Phase");
            outputCard.body.push("Roll Action Dice - Shadow First");
            outputCard.body.push("Action Phase - Free Peoples First");
        }
        PrintCard();
    }


    const ChangeDice = (name,condition) => {
        let side = "Shadow";
        let sideName = "Shadow";
        if (name === "Aragorn" || name === "Gandalf the White") {
            side = "Free";
            sideName = "Free Peoples";
        }
        if (condition === "Add" && state.WOTR.characters[name] === false) {
            SetupCard(name + " Enters Play","",side);
            outputCard.body.push("One Die is added to the " + sideName);
            PrintCard();
            state.WOTR.dice[side]++;
            state.WOTR.characters[name] = true;
        } else if (condition === "Remove" && state.WOTR.characters[name] === true) {
            SetupCard(name + " Dies!","",side);
            outputCard.body.push("One Die is removed from the " + sideName);
            PrintCard();
            state.WOTR.dice[side]--;
            state.WOTR.characters[name] = false;
        }
    }


    const DrawHuntTile = (msg) => {
        log(msg.content)
        let special = msg.content.split(";")[1];
        let tokenID = msg.content.split(";")[2] || "";
        let tempArray = DeepCopy(state.WOTR.huntTiles);
        let number = 1;
        let img;
        let drawn = [];
        let eyes = [];
        if (special === "Challenge") {number = 3};
        for (let i=0;i<number;i++) {
            let length = tempArray.length;
            if (length === 0) {
                //reshuffle regular tiles
                tempArray = Object.keys(Tiles.Regular);
                //take out any removed and already drawn tiles
                _.each(state.WOTR.removedTiles,tile => {
                    let index = tempArray.indexOf(tile)
                    tempArray.splice(index,1);
                })
                _.each(drawn,tile => {
                    let index = tempArray.indexOf(tile)
                    tempArray.splice(index,1);
                })
                length = tempArray.length;
            }
            let index = randomInteger(length) - 1;
            let reference = tempArray[index];
            let tile;
            if (isNaN(reference)) {
                tile = DeepCopy(Tiles.Special[reference]);
                tile.special = true;
                if (tile.effect.includes("The Ring is Mine!")) {
                    eyes.push(reference);
                }
            } else {
                reference = parseInt(reference)
                tile = DeepCopy(Tiles.Regular[reference]);
                tile.special = false;
                if (tile.type.includes("eye")) {
                    eyes.push(reference);
                }
            }
            tile.reference = reference;
            drawn.push(tile);
            tempArray.splice(index,1);
        }

        if (special === "Challenge") {
            SetupCard("Aragorn Challenges Sauron!","","Free");
            for (let i=0;i<drawn.length;i++) {
                img = getCleanImgSrc(drawn[i].image);
                outputCard.body.push("<img width = 64 height = 64 src=" + img + "></img>");
            }
            outputCard.body.push("[hr]");
            if (eyes.length === 3) {
                outputCard.body.push("Sauron does not fall for the Ruse and attacks!");
                outputCard.body.push("Aragorn is killed in the ensuing Struggle");
                outputCard.body.push("Remove Aragorn/Strider");
                eyes = []; //will have all the drawn tiles aka eyes go back in
            } else if (eyes.length > 0 && eyes.length < 3) {
                outputCard.body.push("Success!");
                outputCard.body.push("Believing Aragorn might have the Ring, Sauron is distracted from the Hunt for the Ringbearers");
                outputCard.body.push("Drawn Eye Tiles are removed from the Pool");
                for (let i=0;i<eyes.length;i++) {
                    state.WOTR.removedTiles.push(eyes[i]);
                }
            } else if (eyes.length === 0) {
                outputCard.body.push("Sauron fails to fall for the Ruse and there is no Effect");
            }
            //place drawn back into pool
            for (let i=0;i<drawn.length;i++) {
                let ref = drawn[i].reference;
                if (eyes.includes(ref)) {continue};
                tempArray.push(ref);
            }
        } else if (special === "Mithril") {
            SetupCard("Mithril Coat and Sting!","","Free");
            outputCard.body.push("A New Tile is Drawn, while the last Tile returns to the Pool");
            tempArray.push(lastTileKey);
            outputCard.body.push("Discard the Mithril Coat and Sting Card");
            outputCard.body.push("[hr]");
            Tile2(drawn[0],special,"Mithril");
        } else if (special === "Card") {
            let token = findObjs({_type:"graphic", id: tokenID})[0];
            let cardid = token.get("cardid");
            let cardInfo = MasterCardList[cardid]
            SetupCard(cardInfo.name,"","Shadow");
            if (drawn[0].type.includes("eye") || drawn[0].type.includes("fellowship special")) {
                outputCard.body.push("<img width = 64 height = 64 src=" + drawn[0].image + "></img>");
                outputCard.body.push("No Effect or Corruption");
            } else {
                Tile2(drawn[0],special,cardInfo.name);
            }
        } else {
            SetupCard("Hunt for the Ring","","Shadow");
            Tile2(drawn[0],special);
        }

        log(tempArray)

        state.WOTR.huntTiles = tempArray;
        PrintCard();
    }


    const Tile2 = (tile,special,note) => {
        if (!note) {note = "Nil"};
        let guide = TokensInArea("Companions","Guide")[0];
        outputCard.body.push("<img width = 64 height = 64 src=" + tile.image + "></img>");
        let huntDice = TokensInArea("Hunt Dice","Shadow Hunt").length;
        let freeDice = TokensInArea("Free Dice","Free Hunt").length;
        let d;
        if (tile.type.includes("eye")) {
            if (state.WOTR.Mordor === true) {
                d = huntDice + freeDice + "*";
            } else {
                d = special + "*";
            }
        } else {
            d = parseInt(tile.damage);
            if (tile.reference === "Shelob's Lair") {
                d = randomInteger(6);
            }
            if (isNaN(tile.reference)) {
                outputCard.body.push(tile.reference);
            }
        }
        outputCard.body.push(d + " Corruption");
        lastTileKey =  tile.reference;
        if (note.includes("Breaking")) {
            tile.revealed = false;
            tile.stopped = false;
            if (guide !== "Gollum") {
                let number = TokensInArea("Companions",["Guide","Companions"]).length;
                number = Math.min(parseInt(d),number);
                outputCard.body.push(number + " Companions must be separated from the Fellowship");
                d = 0;
            } else {
                d = 1;
            }
        }

        if (tile.revealed === true) {
            if (guide === "Gollum" && tile.type.includes("eye") === false && tile.type.includes("special") === false) {
                tile.revealed = false;
                outputCard.body.push("Gollum prevents the Fellowship from being Revealed");
            } else {
                outputCard.body.push("The Fellowship is Revealed");
                if (note === "Balrog of Moria") {
                    outputCard.body.push("(Ignore if declared in a Free People's City or Stronghold)");
                }
            }
        }
        if (tile.stop && tile.stop == true) {
            outputCard.body.push("The Fellowship is Stopped and Cannot Advance on the Mordor Track");
        }

        outputCard.body.push("[hr]");
        if (note.includes("Mithril") === false && note.includes("Isildur's Bane") === false) {
            outputCard.body.push("The Free Player may use a relevant Card");
        }
        if (guide === "Gollum" && d > 0 && tile.revealed === false) {
            if (note.includes("Breaking")) {
                outputCard.body.push("The Fellowship takes 1 point of Corruption");
            } else {
                outputCard.body.push("Gollum's Ability could be used (see Card)");
            }
        }

        if (d > 0) {            
            if (note === "Foul Thing from the Deep" && guide !== "Gollum") {
                let companions = TokensInArea("Companions",["Guide","Companions"]);
                let roll = randomInteger(companions.length) - 1;
                let companion = companions[roll];
                outputCard.body.push("If Damage Remains after any Abilities/Card are used: " + companion + " is killed by the Foul Thing");
            }
            if ((guide === "Peregrin Took" || guide === "Meriadoc Brandybuck") && note.includes("Isildur's Bane") === false) { 
                outputCard.body.push(guide + "'s ability could be used");
            }
            if (note.includes("Isildur's Bane")) {
                outputCard.body.push("The Fellowship gains " + d + " Corruption as Frodo puts on the Ring");
            } else {
                outputCard.body.push("Resolve the Hunt Damage");
            }


        }
    }

















    const CombatDice = (msg) => {
        let playerID = msg.playerid;
        let side = state.WOTR.players[playerID];
        if (!side) {
            sendChat("","This Player has not yet picked a Side");
            return;
        }
        let diceName = side+"Attack";
        let dice = parseInt(msg.content.split(";")[1]);
        let max = parseInt(msg.content.split(";")[2]);
        let rerolls = (msg.content.split(";")[3] === "false") ? false:true;
        dice = Math.max(Math.min(dice,max),1);
        SetupCard("Attack","",side);
        let rolls = [];
        let out = [];
        for (let i=0;i<dice;i++) {
            let roll = randomInteger(6);
            rolls.push(roll)
        }
        rolls.sort();
        _.each(rolls,roll => {
            out.push(DisplayDice(roll,diceName,36));
        })
        out = out.toString();
        outputCard.body.push(out);
        PlaySound("Dice");
        if (rerolls === true) {
            ButtonInfo("Rerolls ?","!CombatDice;?{# of Rerolls|0};" + dice + ";" + false);
        }
        PrintCard();
    }

    const PickSides = (msg) => {
        //!PickSides;?{Side|Free|Shadow}
        let side = msg.content.split(";")[1];
        let playerID = msg.playerid;
        state.WOTR.players[playerID] = side;
        let deckName = (side === "Shadow") ? "Minion Cards":"Character Cards";
        let deck = DeckInfo[deckName];
        log(deck.cards)
        for (let i=0;i < Object.keys(deck.cards).length;i++) {
            let cardID = drawCard(deck.id);
            if (cardID) {
                giveCardToPlayer(cardID,playerID);
            }
        }
        SetupCard(side,"",side);
        outputCard.body.push(PlayerInfo[playerID] + " will be playing " + side);
        PrintCard();
    }   


    const ClearState = (msg) => {
        //rebuild array of card IDs for each deck, will track which ones are played using this
        //DeckInfo is the master array of full deck
        _.each(DeckInfo,info => {
            let deckID = info.id;
            recallCards(deckID);
            sendChat("","Shuffled " + info.name);
            shuffleDeck(deckID);
        })
        //rebuild array of regular hunt tiles
        let huntTiles = Object.keys(Tiles.Regular);

        ClearDice("Free");
        ClearDice("Shadow");

        state.WOTR = {
            players: {},
            turn: 0,
            diceIDs: {
                "Shadow": [],
                "Free": [],
            },
            dice: {Free: 4,Shadow: 7},
            characters: {Aragorn: false, "Gandalf the White": false,"The Witch-King": false, "The Mouth of Sauron": false, Saruman: false},
            huntTiles: huntTiles,
            removedTiles: [],
            Mordor: false,
            CardsInPlay: [],
        }
    
        sendChat("","Cleared State/Arrays, rebuilt and shuffled Decks, rebuilt Hunt Tiles");
    }


    const Size = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let token = findObjs({_type:"graphic", id: id})[0];
        token.set({
            width: 100,
            height: 100,
        })
    }

    const changeGraphic = (tok,prev) => {
        //fix the token size in case accidentally changed while game running - need check that game is running
        if (state.WOTR.turn === 0) {return};
        let name = tok.get("name");
        if (tok.get("width") !== prev.width || tok.get("height") !== prev.height) {
            tok.set({
                width: prev.width,
                height: prev.height,
            })
        }
        //if (Characters.includes(name)) {ChangeDice(name,"Add")};
        if (name === "The Fellowship" && state.WOTR.Mordor === false) {MordorHunt(tok)};
    }

    const addGraphic = (obj) => {
        log(obj)
        let cardid = obj.get("cardid");
        let cardInfo = MasterCardList[cardid]
        if (cardInfo) {
            toFront(obj);
            log(cardInfo.name + "  From " + cardInfo.deckName);
            obj.set("name",cardInfo.name);
            if (state.WOTR.Mordor === true) {
                let list = Object.keys(Tiles.Special);
                if (list.includes(cardInfo.name)) {
                    state.WOTR.huntTiles.push(cardInfo.name);
                }
            }
            if (cardInfo.name === "Challenge of the King") {
                let charID = "-OQPz-jE4lI791zT36ox";
                obj.set("represents",charID);
            }
            if (cardInfo.name === "Mithril Coat and Sting") {
                //attach token to character , which has the macro
                let charID = "-OQPCPFdqsbkEGAApKG6";
                obj.set("represents",charID);
            }
            
            if (Characters.includes(cardInfo.name)) {ChangeDice(cardInfo.name,"Add")};
            if (cardInfo.name === "Flocks of Crebain") {
                state.WOTR.CardsInPlay.push("Flocks of Crebain");
            }
            let cardswithtiles = ["Foul Thing from the Deep","Isildur's Bane","Orc Patrol","Balrog of Moria","The Breaking of the Fellowship"]
            if (cardswithtiles.includes(cardInfo.name)) {
                let charID = "-OQnOSPecLIHhLPKjUOu";
                obj.set("represents",charID);
            }








        }
    }
    
    const destroyGraphic = (obj) => {
        let name = obj.get("name");
        if (Characters.includes(name)) {ChangeDice(name,"Remove")};
        let index = state.WOTR.CardsInPlay.indexOf(name);
        if (index > -1) {
            state.WOTR.CardsInPlay.splice(index,1);
        }
    }


    const Info = () => {
        let a = findObjs({_type:'macro'});
        _.each(a,b => {
            log(b);
        })
    }





    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
    
        switch(args[0]) {
            case '!Dump':
                log(MasterCardList)
                log("State");
                log(state.WOTR);
                log("Deck Info");
                log(DeckInfo);
                log("Map Areas");
                log(MapAreas);
                log("Player Hands");
                log(PlayerHands);
                break;
            case '!Info':
                Info();
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!RollAction':
                RollAction(msg);
                break;
            case '!HuntDice':
                HuntDice(msg);
                break;
            case '!Size':
                Size(msg);
                break;
            case '!Flip':
                Flip(msg);
                break;
            case '!PickSides':
                PickSides(msg);
                break;
            case '!DrawCard':
                DrawCard(msg);
                break;
            case '!NewTurn':
                NewTurn();
                break;
            case '!DrawHuntTile':
                DrawHuntTile(msg);
                break;
            case '!CombatDice':
                CombatDice(msg);
                break;
            case '!ChooseCompanion':
                ChooseCompanion();
                break;
            case '!Hunt':
                Hunt(msg);
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
        log("===> War of the Ring <===");
        log("===> Software Version: " + version + " <===")
        PlayerIDs();
        BuildMap();
        BuildDecks(); //the master array of id and names
        registerEventHandlers();
        sendChat("","API Ready")
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();
