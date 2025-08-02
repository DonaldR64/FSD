const AttackDice = () => {

//change variables to be fed in

    let fp = 8;
    let defence = 3;
    let target = 15;
    let augment = 12;
    
    //others, eg weapon stats
    let aAbilities = " ";
    let dAbilities = " ";
    let weapon = " ";
    if (weapon.includes("Laser")) {augment = 11};



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

    if (weapon.includes("Dual")) {
        if (attackRolls[0] < 7) {
            aTip += "<br>Dual: " + attackRolls[0];
            attackRolls[0] = randomInteger(12);
            aTip += "->" + attackRolls[0];
            attackRolls.sort();
        }
    }
    if (dAbilities.includes("Point Defence")) {
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
    if (aAbilities.includes("Assisted Targetting")) {
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

    let originalAttackRolls = deepCopy(attackRolls); //used for output
    let originalDefenceRolls = deepCopy(defenceRolls); //used for output
    let explodingAttackRolls = [];
    let explodingDefenceRolls = [];


    //cancel out any 12s before exploding - only done on initial rolls
    let a12count = attackRolls.filter(num => num === 12).length;
    let d12count = defenceRolls.filter(num => num === 12).length;
    let min = Math.min(a12count,d12count);
    for (let i=0;i<min;i++) {
        let pos = attackRolls.indexOf(12);
        if (pos > -1) {
            attackRolls.splice(pos,1);
        }
        pos = defenceRolls.indexOf(12);
        if (pos > -1) {
            defenceRolls.splice(pos,1);
        }
    }

    //explode any remaining 12s, and cancel out any matching for defence
    for (let i=0;i<a12count;i++) {
        do {
            roll = randomInteger(12);
            attackRolls.push(roll);
            explodingAttackRolls.push(roll);
        }
        while (roll === 12);
    }
    for (let i=0;i<d12count;i++) {
        do {
            roll = randomInteger(12);
            defenceRolls.push(roll);
            explodingDefenceRolls.push(roll);
        }
        while (roll === 12);
    }
    attackRolls.sort();
    defenceRolls.sort();
    explodingAttackRolls.sort();
    explodingDefenceRolls.sort();

    //cancel out rolls now
    _.each(defenceRolls,roll => {
        let pos = attackRolls.indexOf(roll);
        if (pos > -1) {
            attackRolls.splice(pos,1);
        }
    })

    let groups = [];
    let unassignedRolls = [];
    attackRolls.sort((a,b) => b - a); //sort highest to lowest for this

    if (attackRolls.length > 0) {
        //assign criticals to their own groups initially
        do {
            roll = attackRolls.shift();
            if (roll) {
                let nextRoll = attackRolls[0];
                if (nextRoll && roll === nextRoll) {
                    roll = attackRolls.shift();
                    let sum = roll * 2;
                    let needed = Math.max(target - sum)
                    let info = {
                        rolls: [roll,roll],
                    }
                    groups.push(info);
                } else {
                    unassignedRolls.push(roll);
                }
            }
        } while (attackRolls.length > 0);
        unassignedRolls.sort((a,b) => a - b);

        //run through critical groups and see if have exact needed numbers in unassignedRolls
        //note down info on the group's math also
        for (let i=0;i<groups.length;i++) {
            let rolls = groups[i].rolls;
            let sum = SumArray(rolls);
            let needed = Math.max(target - sum,0);
            if (needed > 0) {
                let pos = unassignedRolls.indexOf(needed);
                if (pos > -1) {
                    rolls.push(unassignedRolls[pos]);
                    unassignedRolls.splice(pos,1);
                    needed = 0;
                    sum = needed;
                }
            }
            let info = {
                sum: sum,
                needed: needed,
                rolls: rolls,
                critical: true,
            }
            groups[i] = info;
        }
        //sort critical groups based on needed, 
        groups.sort((a,b) => a.needed - b.needed);
        //fill with unassigned, searching for exacts or using lowest
        for (let i=0;i<groups.length;i++) {
            let group = groups[i];
            if (group.needed > 0 && unassignedRolls.length > 0) {
                do {
                    let pos = unassignedRolls.indexOf(group.needed);
                    if (pos > -1) {
                        roll = unassignedRolls[pos];
                        unassignedRolls.splice(pos,1);
                    } else {
                        roll = unassignedRolls.shift();
                    }
                    group.rolls.push(roll);
                    if (roll >= group.needed) {
                        group.needed = 0;
                        group.sum = SumArray(group.rolls);
                    }
                } while (group.needed > 0 && unassignedRolls.length > 0);
            }
        }
        //critical groups now filled or no more unassignedRolls
        //if further unassignedRolls, assign these to groups
        //start with highest #, search for exact and if not, fill with lowest
        if (unassignedRolls > 0) {
            do {
                roll = unassignedRolls.pop();
                let info = {
                    sum: roll,
                    needed: Math.max(0,target - roll),
                    rolls: [roll],
                    critical: false,
                }
                if (info.needed > 0 && unassignedRolls.length > 0) {
                    do {
                        let pos = unassignedRolls.indexOf(info.needed);
                        if (pos > -1) {
                            roll = unassignedRolls[pos];
                            unassignedRolls.splice(pos,1);
                        } else {
                            roll = unassignedRolls.shift();
                        }
                        info.rolls.push(roll);
                        if (roll >= info.needed) {
                            info.needed = 0;
                            info.sum = SumArray(info.rolls);
                        }
                    } while (info.needed > 0 && unassignedRolls.length > 0);
                }
                groups.push(info);
            } while (unassignedRolls.length > 0);
        }
    }


    SetupCard("Test","","Neutral");
    let line1 = "Attack Rolls: " + originalAttackRolls.toString();
    if (explodingAttackRolls.length > 0) {
        line1 += " + " + explodingAttackRolls.toString();
    }
    let line2 = "Defence Rolls: " + originalDefenceRolls.toString();
    if (explodingDefenceRolls.length > 0) {
        line2 += " + " + explodingDefenceRolls.toString();
    }
    outputCard.body.push(line1);
    outputCard.body.push(line2);
    if (attackRolls.length > 0) {
        outputCard.body.push("Final Attack Rolls: " + attackRolls.toString());
    } else {
        outputCard.body.push("All Attacks Defeated by Defences");
    }
    outputCard.body.push("[hr]");
    let noncriticals = 0;
    let criticals = 0;
    let totalHits = 0;
    _.each(groups,group => {
        let line = group.rolls.toString() + " : "
        if (group.needed === 0) {
            if (group.critical === true) {
                criticals++;
                line += "Critical Hit";
            } else {
                noncriticals++;
                line += "Hit";
            }
        } else {
            line += " Miss";
        }
    })
    totalHits = noncriticals + (2*criticals);
    outputCard.body.push("[hr]");
    outputCard.body.push("Total Hits: " + totalHits);

    PrintCard();






}


const SumArray = (array) => {
    //sum an array of numbers
    let sum = 0;
    _.each(array,element => {
        sum += element;
    })
    return sum;
}