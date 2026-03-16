/**
 * File: GameEngine.ts
 * Purpose: Oyunun ana motoru. Tüm core sistemleri yönetir.
 */

import BoardEngine from "./BoardEngine"
import { GameState, PlayerState } from "./GameState"

import { buildDeck, giveCardToPlayer } from "./DeckEngine"
import { tracePlayerPath } from "./PathEngine"
import { eliminatePlayer, nextPlayer } from "./TurnEngine"

import { findCurrentPlayerNextCell } from "./PathEngine"
import { getValidMovesForPlayer } from "./RuleEngine"

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
        throw new Error("Game not started")

    const player = this.state.players[this.state.currentPlayer]

    // kart yerleştir
    this.state.board.placeCard(
        x,
        y,
        cardId,
        rotation,
        player.id
    )

    // elden kart çıkar
    const index = player.hand.indexOf(cardId)

    if(index >= 0)
        player.hand.splice(index,1)

    // yeni kart çek
    giveCardToPlayer(this.state,this.state.currentPlayer)

    // PATH hesapla
    const result = tracePlayerPath(
        this.state,
        player.id
    )

    if(result === "OUT_OF_BOARD")
    {
        console.log("PLAYER LOST:",player.id)

        eliminatePlayer(
            this.state,
            player.id
        )
    }

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


runBotTurn()
{
    if(!this.state) return

    const currentPlayer = this.state.players[this.state.currentPlayer]

    if(!currentPlayer.isBot) return

    const botLevel = currentPlayer.botLevel || "normal"

    console.log("BOT TURN")

    const validMoves = getValidMovesForPlayer(
        this.state,
        this.state.currentPlayer
    )

    if(validMoves.length === 0)
    {
        console.log("BOT NO MOVES")
        return
    }

    let selectedMove

    if(botLevel === "easy")
    {
        selectedMove =
            validMoves[Math.floor(Math.random() * validMoves.length)]
    }

    else if(botLevel === "normal")
    {
        const safeMoves = []

        const nextCell = findCurrentPlayerNextCell(
            this.state,
            currentPlayer.id
        )

        if(!nextCell)
        {
            selectedMove =
                validMoves[Math.floor(Math.random() * validMoves.length)]
        }
        else
        {
            for(const move of validMoves)
            {
                const testState: GameState =
                {
                    board: new BoardEngine(this.state.board.size),
                    players: JSON.parse(JSON.stringify(this.state.players)),
                    deck: [...this.state.deck],
                    discard: [...this.state.discard],
                    currentPlayer: this.state.currentPlayer
                }

                // Board kopyala
                for(let y = 0; y < this.state.board.size; y++)
                {
                    for(let x = 0; x < this.state.board.size; x++)
                    {
                        const cell = this.state.board.getCell(x,y)

                        if(cell && cell.cardId !== null && cell.owner !== null)
                        {
                            testState.board.placeCard(
                                x,
                                y,
                                cell.cardId,
                                cell.rotation,
                                cell.owner
                            )
                        }
                    }
                }

                const simPlayer =
                    testState.players[testState.currentPlayer]

                // BOT move simulate
                testState.board.placeCard(
                    nextCell.x,
                    nextCell.y,
                    move.cardId,
                    move.rotation,
                    simPlayer.id
                )

                const result = tracePlayerPath(
                    testState,
                    simPlayer.id
                )

                if(result !== "OUT_OF_BOARD")
                {
                    safeMoves.push(move)
                }
            }

            if(safeMoves.length > 0)
            {
                selectedMove =
                    safeMoves[Math.floor(Math.random() * safeMoves.length)]
            }
            else
            {
                selectedMove =
                    validMoves[Math.floor(Math.random() * validMoves.length)]
            }
        }
    }

    else
    {
        selectedMove =
            validMoves[Math.floor(Math.random() * validMoves.length)]
    }

    const nextCell = findCurrentPlayerNextCell(
        this.state,
        currentPlayer.id
    )

    if(!nextCell) return

    return {
        cardId: selectedMove.cardId,
        rotation: selectedMove.rotation,
        x: nextCell.x,
        y: nextCell.y
    }
}

}