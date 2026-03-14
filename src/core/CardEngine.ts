/**
 * File: CardEngine.ts
 * Purpose: Kart bağlantılarını döndürme ve port dönüşümlerini hesaplar
 */

import { Connection, Port } from "../data/CardData"
import { CardDefinitions } from "../data/CardDefinitions"

/**
 * Kart tanımını getir
 */
export function getCardDefinition(cardId:string)
{
    const card = CardDefinitions.find(c => c.id === cardId)

    if(!card)
    {
        throw new Error("Card not found: " + cardId)
    }

    return card
}

/**
 * Port döndürme
 * Her 90° dönüş portu +2 ilerletir
 */
export function rotatePort(port:Port, rotation:number):Port
{
    let p = port

    for(let i=0;i<rotation;i++)
    {
        p = (p + 2) as Port

        if(p > 8)
        {
            p = (p - 8) as Port
        }
    }

    return p
}

/**
 * Connection listesini döndür
 */
export function rotateConnections(
    connections:Connection[],
    rotation:number
):Connection[]
{
    return connections.map(c => [

        rotatePort(c[0], rotation),
        rotatePort(c[1], rotation)

    ])
}

/**
 * Kartın döndürülmüş bağlantılarını getir
 */
export function getRotatedConnections(
    cardId:string,
    rotation:number
):Connection[]
{
    const card = getCardDefinition(cardId)

    return rotateConnections(
        card.connections,
        rotation
    )
}