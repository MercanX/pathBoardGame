/**
 * File: GameEngine.ts
 * Purpose: Oyunun ana motoru. Tüm core sistemleri yönetir.
 */

import BoardEngine from "./BoardEngine"
import { GameState, PlayerState } from "./GameState"

import { buildDeck, giveCardToPlayer } from "./DeckEngine"
import { tracePlayerPath, tracePlayerPathCells,findCurrentPlayerNextCell } from "./PathEngine"
import { eliminatePlayer, nextPlayer } from "./TurnEngine"

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
        let bestMove = null
        let bestScore = -1

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

                if(result === "OUT_OF_BOARD")
                {
                    continue
                }

                const pathCells = tracePlayerPathCells(
                    testState,
                    simPlayer.id
                )

                const score = pathCells.length

                if(score > bestScore)
                {
                    bestScore = score
                    bestMove = move
                }
            }

            if(bestMove)
            {
                selectedMove = bestMove
            }
            else
            {
                selectedMove =
                    validMoves[Math.floor(Math.random() * validMoves.length)]
            }
        }
    }

    else if(botLevel === "hard")
    {
        let bestMove = null
        let bestScore = -999999

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

                if(result === "OUT_OF_BOARD")
                {
                    continue
                }

                const pathCells = tracePlayerPathCells(
                    testState,
                    simPlayer.id
                )

                let score = pathCells.length * 10

                const lastCell = pathCells[pathCells.length - 1]

                if(lastCell)
                {
                    const distToEdge =
                        Math.min(
                            lastCell.x,
                            lastCell.y,
                            this.state.board.size - 1 - lastCell.x,
                            this.state.board.size - 1 - lastCell.y
                        )

                    score += distToEdge * 3
                }

                if(score > bestScore)
                {
                    bestScore = score
                    bestMove = move
                }
            }

            if(bestMove)
            {
                selectedMove = bestMove
            }
            else
            {
                selectedMove =
                    validMoves[Math.floor(Math.random() * validMoves.length)]
            }
        }
    }

    else if(botLevel === "insane")
    {
        let bestMove = null
        let bestScore = -999999

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

                if(result === "OUT_OF_BOARD")
                {
                    continue
                }

                const pathCells = tracePlayerPathCells(
                    testState,
                    simPlayer.id
                )

                let score = pathCells.length * 10

                const nextCell2 = findCurrentPlayerNextCell(
                    testState,
                    simPlayer.id
                )

                if(nextCell2)
                {
                    const validMoves2 = getValidMovesForPlayer(
                        testState,
                        testState.currentPlayer
                    )

                    score += validMoves2.length * 5
                }

                if(score > bestScore)
                {
                    bestScore = score
                    bestMove = move
                }
            }

            if(bestMove)
            {
                selectedMove = bestMove
            }
            else
            {
                selectedMove =
                    validMoves[Math.floor(Math.random() * validMoves.length)]
            }
        }
    }


    else if(botLevel === "insane02")
    {
        let bestMove = null
        let bestScore = -999999

        const nextCell = findCurrentPlayerNextCell(
            this.state,
            currentPlayer.id
        )

        const enemies = this.state.players.filter(
            p => p.id !== currentPlayer.id && p.isAlive!== false
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

                if(result === "OUT_OF_BOARD")
                {
                    continue
                }

                const pathCells = tracePlayerPathCells(
                    testState,
                    simPlayer.id
                )

                let score = pathCells.length * 10

                for(const enemy of enemies)
                {
                    const enemyPath = tracePlayerPathCells(
                        testState,
                        enemy.id
                    )

                    for(const cell of enemyPath)
                    {
                        if(cell.x === nextCell.x && cell.y === nextCell.y)
                        {
                            score += 50
                        }
                    }
                }

                if(score > bestScore)
                {
                    bestScore = score
                    bestMove = move
                }
            }

            if(bestMove)
            {
                selectedMove = bestMove
            }
            else
            {
                selectedMove =
                    validMoves[Math.floor(Math.random() * validMoves.length)]
            }
        }
    }

    else if(botLevel === "ultra")
    {
        let bestMove = null
        let bestScore = -999999

        const nextCell = findCurrentPlayerNextCell(
            this.state,
            currentPlayer.id
        )

        const enemies = this.state.players.filter(
            p => p.id !== currentPlayer.id && p.isAlive!== false
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

                // BOARD COPY
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

                // MOVE SIMULATION
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

                if(result === "OUT_OF_BOARD")
                {
                    continue
                }

                const pathCells = tracePlayerPathCells(
                    testState,
                    simPlayer.id
                )

                let score = pathCells.length * 10

                // FUTURE MOVE ANALYSIS
                const nextCell2 = findCurrentPlayerNextCell(
                    testState,
                    simPlayer.id
                )

                if(nextCell2)
                {
                    const validMoves2 = getValidMovesForPlayer(
                        testState,
                        testState.currentPlayer
                    )

                    score += validMoves2.length * 5
                }

                // EDGE RISK
                const lastCell = pathCells[pathCells.length - 1]

                if(lastCell)
                {
                    const distToEdge =
                        Math.min(
                            lastCell.x,
                            lastCell.y,
                            this.state.board.size - 1 - lastCell.x,
                            this.state.board.size - 1 - lastCell.y
                        )

                    score += distToEdge * 3
                }

                // ENEMY BLOCK
                for(const enemy of enemies)
                {
                    const enemyPath = tracePlayerPathCells(
                        testState,
                        enemy.id
                    )

                    for(const cell of enemyPath)
                    {
                        if(cell.x === nextCell.x && cell.y === nextCell.y)
                        {
                            score += 50
                        }
                    }
                }

                if(score > bestScore)
                {
                    bestScore = score
                    bestMove = move
                }
            }

            if(bestMove)
            {
                selectedMove = bestMove
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