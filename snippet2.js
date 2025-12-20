const Aura = (unit) => {
    ///checks if model or assoc leader has an active aura
    let auras = unit.keywords.filter((e) => e.includes("Aura"));
    let label = unit.hexLabel();
    _.each(UnitArray,unit2 => {
        if (unit2.faction === unit.faction) {
            if (unit2.hexLabel === label) {
                auras = auras.concat(unit.keywords.filter((e) => e.includes("Aura")));
            }
        }
    })
    auras = auras.map((e) => e.replace(" Aura",""));
    return auras;
}