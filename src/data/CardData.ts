/**
 * File: CardData.ts
 * Purpose: Kart port ve bağlantı veri modellerini tanımlar
 */

export type Port =
    1 | 2 | 3 | 4 |
    5 | 6 | 7 | 8

export type Connection = [Port,Port]

export interface CardDefinition
{
    id:string
    sprite:string
    connections:Connection[]
}