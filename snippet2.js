const ApplyDamage = (defenders,weapon,crits,hits) => {
    //crits is subset. of hits
    //if more than one defender (hero) then apply to 1st until dead etc.

    const DefenseOutput = () => {
        defenseRolls.sort((a,b) => b - a);
        let tip = "Rolls: " + defenseRolls.toString() + " vs. " + needed + "+";
        tip += neededTip + defenseTip;
        if (bane > 0) {
            let s = (bane === 1) ? "":"s";
            tip += "<br>Bane caused " + bane + " Reroll" + s;
        }
        if (rending > 0) {
            let s = (rending === 1) ? "":"s";
            tip += "<br>Rending affected " + rending + " Roll" + s;
        }
        ignoreRolls = ignoreRolls.sort((a,b) => b-a);
        if (ignoreRolls.length > 0) {
            tip += "<br>" + ig.reason + " removes " + ignore + " Wounds";
            tip += "<br>Rolls: " + ignoreRolls.toString() + " vs. " + ig.target + "+";

        }
        regenRolls = regenRolls.sort((a,b) => b-a);
        if (regenRolls.length > 0) {
            tip += "<br>" + rg.reason + " removes " + regen + " Wounds";
            tip += "<br>Rolls: " + regenRolls.toString() + " vs. " + rg.target + "+";
        }

        let s = (totalWounds === 1) ? "":"s";
        tip = '[' + totalWounds + '](#" class="showtip" title="' + tip + ')';
        output.push(defender.name + ' takes ' + tip + " Wound" + s) ;
        if (totalWounds >= hp) {
            output.push(defender.name + " is Destroyed!");
        }
    }

    let defenseRolls = [];
    let defenseTip = "";

    let bane = 0,rending = 0;
    let totalWounds = 0;
    let unitWounds = 0;

    let deadly = parseInt(weapon.keywords.find((e) => e.includes("Deadly")).replace(/[^\d]/g,""));

    let output = [];

    let defender = defenders[0];
    let hp = parseInt(defender.token.get("bar1_value"));

    let needed = defender.defense;
    let neededTip = "<br>Defense: " + needed + "+";

    if (weapon.ap > 0) {
        needed += weapon.ap;
        neededTip += "<br>AP +" + weapon.ap;
    }

    let ignoreTotal = 0,regenTotal = 0;
    let ignoreRolls = [],regenRolls = [];

    let active = true;

    hitLoop:
    for (let i=0;i<hits;i++) {

        if (i < crits && weapon.keywords.includes("Rending")) {
            needed += 4;
            rending++;
        }

        needed = Math.min(6,Math.max(2,needed));

        let defenseRoll = randomInteger(6);
        
        if (defenseRoll === 6 && weapon.keywords.includes("Bane")) {
            roll = randomInteger(6);
            bane++;
        }

        defenseRolls.push(defenseRoll);

        if (defenseRoll < needed) {
            let wounds = 1;
            if (deadly) {
                max = hp - (Math.floor(hp/defender.toughness) * defender.toughness);
                if (max === 0) {
                    max = defender.toughness;
                }
                wounds = Math.min(deadly,max);
                defenseTip += "<br>Deadly - " + wounds + " Wounds";
            }

            //Ignore Wound abilities
            let ignore = 0;
            let ignoreReasons = [{reason: "Plaguebound", target: 6},];

            let ig = ignoreReasons.find((e) => defender.keywords.includes(e.reason));
            if (ig) {
                for (let i=0;i<wounds;i++) {
                    let roll = randomInteger(6);
                    ignoreRolls.push(roll);
                    if (roll >= ig.target) {
                        ignore++;
                    }
                }
                ignore = Math.min(wounds,ignore);
                wounds = wounds - ignore;
                ignoreTotal += ignore;
            }

            //Regen Abilities
            let regen = 0;
            let regenReasons = [{reason: "Regeneration", target: 5},];

            let rg = regenReasons.find((e) => defender.keywords.includes(e.reason));
            if (wounds > 0 && rg && weapon.keywords.includes("Unstoppable") === false && weapon.keywords.includes("Bane") === false) {
                _.each(wounds,wound => {
                    let roll = randomInteger(6);
                    regenRolls.push(roll);
                    if (roll >= regenTarget) {
                        regen++;
                    }
                })
                regen = Math.min(wounds,regen);
                wounds = wounds - regen;
                regenTotal += regen;
            }

            unitWounds += wounds;

            if (unitWounds >= hp) {
                //defender is dead, check if another to apply next hit(s) to, or stop if none
                DefenseOutput();

                if (defenders.length > 1) {
                    defenseRolls = [];
                    defenseTip = "";
                    bane = 0,rending = 0;
                    ignoreTotal = 0,regenTotal = 0;
                    ignoreRolls = [],regenRolls = [];
                    unitWounds = 0;
                    defender = defenders[1];
                    hp = parseInt(defender.token.get("bar1_value"));
                    needed = defender.defense;
                    neededTip = "<br>Defense: " + needed + "+";
                    if (weapon.ap > 0) {
                        needed += weapon.ap;
                        neededTip += "<br>AP +" + weapon.ap;
                    }
                    totalWounds += unitWounds;
                } else {
                    //end hits, no other living units
                    active = false;
                    break hitLoop;
                }
            } 
            //continue to next hit as unit still alive

        }
    }
    //end hits
    if (active === true) {
        totalWounds += unitWounds;
        DefenseOutput();
    }

    for (let i=0;i<output.length;i++) {
        outputCard.body.push(output[i]);
    }

    



    return totalWounds; 
}