/**
 * File: PathEngine.ts
 * Purpose: Kart port giriş-çıkış ve yol takip işlemlerini yönetir
 */

import { Connection, Port } from "../data/CardData"

/**
 * Giriş portuna göre çıkış portunu bul
 */
export function findExit(
    entryPort:Port,
    connections:Connection[]
):Port | null
{
    for(const c of connections)
    {
        if(c[0] === entryPort) return c[1]
        if(c[1] === entryPort) return c[0]
    }

    return null
}

/**
 * Çıkış portuna göre hangi hücreye gidileceğini hesapla
 */
export function getNextCellOffset(port:Port)
{
    if(port === 1 || port === 2)
        return {x:0, y:1}

    if(port === 3 || port === 4)
        return {x:1, y:0}

    if(port === 5 || port === 6)
        return {x:0, y:-1}

    if(port === 7 || port === 8)
        return {x:-1, y:0}

    return {x:0,y:0}
}

/**
 * Portun karşı tarafını bul
 */
export function getOppositePort(port:Port):Port
{
    switch(port)
    {
        case 1: return 6
        case 2: return 5
        case 3: return 8
        case 4: return 7
        case 5: return 2
        case 6: return 1
        case 7: return 4
        case 8: return 3
    }
}