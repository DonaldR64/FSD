
    const AttackRolls = () => {

        let attacker = combatArray.attacker;
        let defender = combatArray.defender;
        let weapon = combatArray.weapon || {abilities: " "};
        let rangedFlag = combatArray.ranged;
        let attDice,defDice,attTarget,defTarget;
        if (rangedFlag === true) {
            attDice = combatArray.firepower;
            defDice = combatArray.defence;
            attTarget = combatArray.needed;
        } else {
            attDice = combatArray.attCR;
            defDice = combatArray.defCR;
            attTarget = parseInt(defender.class) + parseInt(defender.armour);
            defTarget = parseInt(attacker.class) + parseInt(attacker.armour);
        }

        let aTip = "";
        let dTip = "";
        let roll;
        let attackRolls = [];
        let defenceRolls = [];

        for (let i=0;i<attDice;i++) {
            roll = randomInteger(12);
            attackRolls.push(roll);
        }
        for (let i=0;i<defDice;i++) {
            roll = randomInteger(12);
            defenceRolls.push(roll);
        }
        attackRolls.sort();
        defenceRolls.sort();

        if (weapon.abilities.includes("Dual") && rangedFlag === true) {
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
        
        if (weapon.abilities.includes("Laser") && rangedFlag === true) {
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
        let finalDefenceRolls = [];
        _.each(defenceRolls,roll => {
            let pos = attackRolls.indexOf(roll);
            if (pos > -1) {
                attackRolls.splice(pos,1);
                cancelledRolls.push(roll)
            } else {
                finalDefenceRolls.push(roll);
            }
        })
        attackRolls.sort((a,b) => b - a); //sort highest to lowest for this
        defenceRolls = DeepCopy(finalDefenceRolls).sort((a,b) => b-a);
        cancelledRolls.sort();

        //output shows original rolls
        combatArray.output = {
            originalAttackRolls: originalAttackRolls,
            originalDefenceRolls: originalDefenceRolls,
            explodingAttackRolls: explodingAttackRolls,
            explodingDefenceRolls: explodingDefenceRolls,
            cancelledRolls: cancelledRolls,
            finalAttackRolls: DeepCopy(attackRolls),
            finalDefenceRolls: finalDefenceRolls,
        }

        //divide into ranged - only attacker can hit, vs CC, where both can get hits

        if (rangedFlag === true) {
            combatArray.results = GroupAttackRolls(attackRolls,attTarget);
        } else {
            combatArray.attResults = GroupAttackRolls(attackRolls,attTarget);
            combatArray.defResults = GroupAttackRolls(defenceRolls,defTarget);
        }

    }


    const GroupAttackRolls = (attackRolls,target) => {
        let groups = [];
        let unassignedRolls = [];

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

        let noncriticals = [];
        let criticals = [];
        let weapon = combatArray.weapon || {abilities: " "};
        let railgunUsed = false;

        _.each(groups,group => {
            let rolls = "[" + group.rolls.sort((a,b) => b-a).toString() + "]";
            if (group.needed === 0) {
                if (group.critical === true) {
                    criticals.push(rolls);
                } else {
                    if (weapon.abilities.includes("Railgun") && railgunUsed === false) {
                        criticals.push("Railgun - " + rolls);
                        railgunUsed = true;
                    } else {
                        noncriticals.push(rolls);
                    }
                }
            }
        })

        if (weapon.abilities.includes("Plasma Accelerator") && (criticals.length + noncriticals.length) > 0) {
            noncriticals.push("Plasma Accelerator - +1 Hit");
        }

        if (weapon.abilities.includes("EMP") && (criticals.length + noncriticals.length) > 0) {
            noncriticals = ["EMP - 1 Hit" + attackRolls.toString()];
            criticals = [];
        }

        results = {
            criticals: criticals,
            noncriticals: noncriticals,
        }
        return results;
    }

