const Keywords = {

    "Ambush": "May be set aside before deployment. At the start of any round after the first, may be deployed anywhere over 4 hexes away from enemy units. Players alternate in placing Ambushers, starting with the player that activates next. Units that deploy via Ambush can’t seize or contest objectives on the round they deploy.",


    "Ambush Beacon": "Friendly Units using Ambush may ignore Distance restrictions if deployed within 3 hexes of this model",

    "Artillery": "May only use Hold actions. When this model shoots at enemies over 4 hexes away, it gets +1 to hit rolls. When enemy units shoot at this model from over 4 hexes away, they get -2 to hit rolls.",

    "Bane": "Ignores Regeneration, and the target must re-roll unmodified Defense results of 6. Note that a die roll may only be re-rolled once, so if another 6 is rolled after re-rolling Defense, then the hit is blocked.",

    "Blast(X)": "Ignores cover, and after resolving other special rules, each hit is multiplied by X, where X is up to as many hits as models in the target unit.",

    "Bounding": "When activated, the unit may 'bound' 1 - 2 Hexes away",
    "Bounding Aura": "[Aura] - When activated, the unit may 'bound' 1 - 2 Hexes away",



    "Butcher": "Ignores Regeneration, and on unmodified results of 6 to hit, this weapon deals 1 extra hits (only the original hit counts as a 6 for special rules)",

    "Caster(X)": "Gets X spell tokens at the start of each round, but can’t hold more than 6 tokens at once. At any point before attacking, spend as many tokens as the spell’s value to try casting one or more spells (only one try per spell). Roll one die, on 4+ resolve the effect on a target in line of sight. Models within 9 hexes and in line of sight of the caster’s unit may spend any number of spell tokens at the same time before rolling, to give the caster +1/-1 to the roll per token. Note that Casters get spell tokens each round even if they are not on the table (waiting to Ambush for example), and that the Caster’s spells must be picked from their own faction.",

    "Counter": "Strikes first with this weapon when charged, and the charging unit gets -1 total Impact rolls per model with Counter.",

    "Counter-Attack": "Strikes first when charged",
    "Counter-Attack Aura": "[Aura] = Strikes first when charged",

    "Dangerous Terrain Debuff": "Once per activation, before attacking, pick one enemy unit within 9 Hexes, which must immediately take a Dangerous Terrain test.",

    "Deadly(X)": "Assign each wound to one model, and multiply it by X. Hits from Deadly must be resolved first, and these wounds don’t carry over to other models if the original target is killed.",


    "Decimate": "Ignores Cover and has AP+2 vs Defense 2 or 3",


    "Evasive": "Enemies get -1 to hit",

    "Fast": "Models with this special rule move +1 Hex when using Advance and +2 Hexes when using Rush/Charge.",

    "Fear(X)": "This model counts as having dealt +X wounds when checking who won melee.",


    "Fearless": "When this unit fails a morale test, roll one die. On a 4+ it counts as passed instead.",


    "Fortified": "Hits count as having AP -1 to a min of AP 0",
    "Fortified Aura": "[Aura] - Hits count as having AP -1 to a min of AP 0",

    "Furious": "When charging, unmodified results of 6 to hit in melee deal 1 extra hit (only the original hit counts as a 6 for special rules).",
    "Furious Aura": "[Aura] - When charging, unmodified results of 6 to hit in melee deal 1 extra hit (only the original hit counts as a 6 for special rules).",

    "Flying": "Models with this special rule may move through units and terrain, and ignore terrain effects whilst moving.",

    "Good Shot": "+1 to Hit when Shooting",

    "Hit & Run": "May Move up to 2 Squares after shooting or melee",
    "Hit & Run Aura": "[Aura] - May Move up to 2 Squares after shooting or melee",
    "Hit & Run Fighter": "May Move up to 2 Squares after melee",
    "Hit & Run Fighter Aura": "[Aura] - May Move up to 2 Squares after melee",
    "Hit & Run Shooter": "May Move up to 2 Squares after shooting",
    "Hit & Run Shooter Aura": "[Aura] - May Move up to 2 Squares after shooting",

    "Immobile": "Models with this special rule may only use Hold actions.",

    "Impact(X)": "Roll X dice when attacking after charging, unless fatigued. For each 2+ the target takes one hit.",

    "Increased Shooting Range": "Shooting gets +3 Hexes to Range",
    "Increased Shooting Range Aura": "[Aura] - Shooting gets +3 Hexes to Range",

    "Indirect": "Gets -1 to hit rolls when shooting after moving. May target enemies that are not in line of sight as if in line of sight, and ignores cover from sight obstructions.",

    "Limited": "Weapons with this rule may only be used once per game.",

    "Melee Shrouding": "Enemies have -2 Hex Movement when charging this Unit",
    "Melee Shrouding Aura": "[Aura] - Enemies have -2 Hex Movement when charging this Unit",

    "Mend": "Once per activation, pick one friendly unit within 2 Hexes and heal D3 wounds",




    "Piercing Shooting Mark": 'Once per activation, pick one enemy unit within 9 Hexes. The next shot against that unit gets AP +1',

    "Plaguebound": "Wounds are ignored on a roll of 6",
    "Plaguebound Boost": "Wounds are ignored on a roll of 5+",
    "Plaguebound Boost Aura": "[Aura] - Wounds are ignored on a roll of 5+",


    "Protected": "Wounds are ignored on a roll of 6",

    "Precision Spotter": "Once per activation, pick one enemy unit within 18 hexes. On a 4+ a Spotting Marker is placed. The next shot against that unit get +1 to hit per marker",





    "Ranged Slayer": "This unit's ranged attacks get AP +2 against units with Tough 3 or higher",
    "Ranged Slayer Aura": "[Aura] - This unit's ranged attacks get AP +2 against units with Tough 3 or higher",

    "Rapid Charge": "Unit moves +3 Hexes when Charging",
    "Rapid Charge Aura": "[Aura] - Unit moves +3 Hexes when Charging",

    "Rapid Rush": "Unit moves +3 Hexes when Rushing",
    "Rapid Rush Aura": "[Aura] - Unit moves +3 Hexes when Rushing",

    "Regeneration": "When a unit where all models have this rule takes wounds, roll one die for each. On a 5+ it is ignored.",


    "Relentless": "When this model shoots at enemies over 4 hexes away, unmodified results of 6 to hit deal 1 extra hit (only the original hit counts as a 6 for special rules).",
    "Relentless Aura": "[Aura] - When this model shoots at enemies over 4 hexes away, unmodified results of 6 to hit deal 1 extra hit (only the original hit counts as a 6 for special rules).",

    "Reliable": "Models attacks at Quality 2+ with this weapon. Note that Reliable only changes the Quality value, so the roll can still be modified, Fatigue still applies, etc.",

    "Rending": "Ignores Regeneration, and on unmodified results of 6 to hit, those hits get AP(+4).",

    "Resistance": "Wounds are ignored on a roll of 6; if from a spell ignored on a 2+ instead",
    "Resistance Aura": "[Aura] - Wounds are ignored on a roll of 6; if from a spell ignored on a 2+ instead",

    "Scout": "May be set aside before deployment. After all other units are deployed, may be deployed anywhere fully within 6 hexes of their deployment zone. Players alternate in placing Scout units, starting with the player that activates next.",
    "Scout Aura": "[Aura] - May be set aside before deployment. After all other units are deployed, may be deployed anywhere fully within 6 hexes of their deployment zone. Players alternate in placing Scout units, starting with the player that activates next.",


    "Shielded": "+1 Defense vs Hits that are not from Spells",

    "Shred": "On unmodified results of 1 to block hits, the weapon deals 1 extra wound",

    "Slam": "Ignores Cover, and on unmodified results of 1 to block hits, the weapon deals 1 extra wound",

    "Slayer": "This unit's attacks get AP +2 against units with Tough 3 or higher",

    "Slow": "This unit has -1 Hex in Advance, and -2 for Charge/Rush",



    "Steadfast": "If the unit is Shaken, at the beginning of the round, on a 4+ it stops being Shaken",
    "Steadfast Buff": "Once per activation, before attacking, pick one friendly unit within 6 hexes, which gets Steadfast once (next time the effect would apply)",


    "Stealth": "When shot at from over 4 hexes away, enemy units get -1 to hit",
    "Stealth Aura": "[Aura] - When shot at from over 4 hexes away, enemy units get -1 to hit",


    "Strafing": "Once per activation, when this model moves through enemy units, pick one of them and attack it with this weapon as if it was shooting. This weapon may only be used in this way.",

    "Strider": "May ignore the effects of difficult terrain when moving.",

    "Surge": "On unmodified results of 6 to hit, this weapon deals 1 extra hit (only the original hit counts as a 6 for special rules).",

    "Targeting Visor Boost": "Shooting at Enemies gets +1 to Hit",
    "Targeting Visor Boost Aura": "[Aura] - Shooting at Enemies gets +1 to Hit",


    "Targeting Visor": "Shooting at Enemies over 4 hexes away gets +1 to Hit",

    "Thrust": "When charging, gets +1 to hit rolls and AP(+1) in melee.",

    "Transport(X)": "May transport units up to X Toughness total, with heroes counting only as Toughness 1. Transports may deploy with units inside, and units may enter/exit by using any move action, but must stay fully within 3 hexes of it when exiting. Units inside/outside transports may not target other units outside/inside transports, but may target the transport itself. When a transport is destroyed, units inside must take a dangerous terrain test, are Shaken, and must be placed fully within 3 hexes of the transport before it’s removed. Note that units inside Transports are deployed at the same time as the Transport, and units can’t both embark/disembark as part of the same activation. Units may use Charge actions to disembark",


    "Unpredicatable": "When attacking, on a 1-3 the unit gets AP(+1), and on a 4-6 the unit gets +1 to hit rolls instead.",
    "Unpredictable Fighter": "When in melee, on a 1-3 the unit gets AP(+1), and on a 4-6 the unit gets +1 to hit rolls instead.",

    "Unstoppable": "Ignores Regeneration, and ignores all negative modifiers to this weapon.",


    "Versatile Attack": "When this unit is activated, pick one effect: +1 to Hit or +1 AP. Lasts until next Activation",
    "Versatile Attack Aura": "[Aura] - When this unit is activated, pick one effect: +1 to Hit or +1 AP. Lasts until next Activation",
    "Versatile Defense": "When this unit is activated, pick one effect: +1 to Defense or -1 to be Hit. Lasts until next Activation",
    "Versatile Defense Aura": "[Aura] - When this unit is activated, pick one effect: +1 to Defense or -1 to be Hit. Lasts until next Activation",



}