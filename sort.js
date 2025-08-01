const Sort = () => {
    let fp = 3;
    let defence = 2;
    let attackRolls = {};
    let defenceRolls = {};
    for (let i=1;i<13;i++) {
        attackRolls[i] = 0;
        defenceRolls[i] = 0;
    }
    let sum = 0;
    let displayAR = [];
    let displayDR = [];
    let target = 15;
    let hits = 0;
    let criticals = 0;
    let roll;

    for (let i=0;i<fp;i++) {
        roll = randomInteger(12);
        attackRolls[i]++;
        displayAR.push(roll);
    }

    for (let i=0;i<defence;i++) {
        roll = randomInteger(12);
        defenceRolls[i]++
        displayDR.push(roll);
    }
    //cancel dice
    for (let i=1;i<13;i++) {
        attackRolls[i] = Math.max(0,attackRolls[i] - defenceRolls[i]);
    }
    //explode any 12s;
    for (let i=0;i<attackRolls[12];i++) {
        do {
            roll = randomInteger(12);
            attackRolls[roll]++;
        }
        while (roll === 12);
    }
    //sum up rolls
    for (let i=1;i<13;i++) {
        sum += attackRolls[i] * i;
    }
    //identify potential criticals
    _.each(attackRolls,roll => {
        criticals += Math.floor(roll/2);
    })
    if (sum < target) {
        criticals = 0;
    }






    SetupCard("Test","","Neutral");
    outputCard.body.push("Attack Rolls: " + displayAR.toString);
    outputCard.body.push("Defence Rolls: " + displayDR.toString);
    outputCard.body.push("Possible Criticals: " + criticals);
    outputCard.body.push("Sum of Rolls: " + sum);
    PrintCard();


}