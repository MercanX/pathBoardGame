/**
 * File: DeckEngine.ts
 * Purpose: Oyun destesini oluşturur, karıştırır ve kart çekme işlemlerini yapar
 */

import { CardDefinitions } from "../data/CardDefinitions"
import { GameState } from "./GameState"
import { GameConfig } from "../config/GameConfig"


/**
 * Tüm kart id listesini çıkar
 */
export function getAllCardIds():string[]
{
    const pool = GameConfig.CARD_POOLS.default

    if(pool && pool.length > 0)
    {
        return pool
    }

    // fallback (full mode)
    return CardDefinitions.map(c => c.id)
}

/**
 * Deste oluştur
 */
export function buildDeck(repeat:number):string[]
{
    const deck:string[] = []
    const cards = getAllCardIds()

    for(let i=0;i<repeat;i++)
    {
        for(const card of cards)
        {
            deck.push(card)
        }
    }

    return shuffle(deck)
}

/**
 * Fisher-Yates shuffle
 */
export function shuffle(arr:string[]):string[]
{
    const deck = [...arr]

    for(let i = deck.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1))

        const temp = deck[i]
        deck[i] = deck[j]
        deck[j] = temp
    }

    return deck
}

/**
 * Desteden kart çek
 */
export function drawCard(state:GameState):string | null
{
    if(state.deck.length === 0)
    {
        return null
    }

    return state.deck.shift() || null
}

/**
 * Oyuncuya kart ver
 */
export function giveCardToPlayer(
    state:GameState,
    playerIndex:number
)
{
    const card = drawCard(state)

    if(!card) return

    state.players[playerIndex].hand.push(card)
}