/**
 * File: CardDefinitions.ts
 * Purpose: Oyunda kullanılacak kartların tanımları
 */

import {CardDefinition} from "./CardData"

export const CardDefinitions:CardDefinition[] = [

{
    id:"card_01",
    sprite:"card_01",
    connections:[
        [1,5],
        [2,6]
    ]
},

{
    id:"card_02",
    sprite:"card_02",
    connections:[
        [1,3],
        [4,7]
    ]
},

{
    id:"card_03",
    sprite:"card_03",
    connections:[
        [2,8],
        [3,5]
    ]
}

]