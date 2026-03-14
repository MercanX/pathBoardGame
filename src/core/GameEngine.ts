/**
 * File: GameEngine.ts
 * Purpose: Oyunun ana motoru. Tüm core sistemleri yönetir.
 */

import BoardEngine from "./BoardEngine"
import { GameState, PlayerState } from "./GameState"

import { buildDeck, giveCardToPlayer } from "./DeckEngine"
import { nextPlayer } from "./TurnEngine"

export default class GameEngine
{
    state:GameState | null = null

    /**
     * Yeni oyun başlat
     */
    startGame(
        boardSize:number,
        players:PlayerState[]
    )
    {
        const board = new BoardEngine(boardSize)

        const deck = buildDeck(5)

        this.state =
        {
            board,
            players,
            deck,
            discard:[],
            currentPlayer:0
        }

        // oyunculara başlangıç kartı dağıt
        for(let i=0;i<players.length;i++)
        {
            for(let k=0;k<5;k++)
            {
                giveCardToPlayer(this.state,i)
            }
        }
    }

    /**
     * Kart oynama
     */
    playCard(
        cardId:string,
        x:number,
        y:number,
        rotation:number
    )
    {
        if(!this.state)
        {
            throw new Error("Game not started")
        }

        const player = this.state.players[this.state.currentPlayer]

        this.state.board.placeCard(
            x,
            y,
            cardId,
            rotation,
            player.id
        )

        // oyuncu elinden kartı çıkar
        const index = player.hand.indexOf(cardId)

        if(index >= 0)
        {
            player.hand.splice(index,1)
        }

        // yeni kart çek
        giveCardToPlayer(this.state,this.state.currentPlayer)

        // sırayı değiştir
        nextPlayer(this.state)
    }

    /**
     * State getir
     */
    getState():GameState | null
    {
        return this.state
    }
}