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
        console.log("START GAME PLAYERS:", players)


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
    console.log("BOT PLAYER FULL:", currentPlayer)

    if(!currentPlayer.isBot) return

    const botLevel = currentPlayer.botLevel || "normal"

    
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
        p => p.id !== currentPlayer.id && p.isAlive !== false
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
            const currentResult = tracePlayerPath(
                this.state,
                currentPlayer.id
            )

            const isInDanger = currentResult === "DEAD_END"

            let strategy = "balanced"

            if(isInDanger)
            {
                strategy = "defensive"
            }
            else if(enemies.length > 0)
            {
                strategy = "aggressive"
            }

            const testState: GameState =
            {
                board: new BoardEngine(this.state.board.size),
                players: JSON.parse(JSON.stringify(this.state.players)),
                deck: [...this.state.deck],
                discard: [...this.state.discard],
                currentPlayer: this.state.currentPlayer
            }

            this.cloneBoardToState(this.state, testState)

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

            // direkt ölüyorsa çöp move
            if(result === "OUT_OF_BOARD")
            {
                continue
            }

            const pathCells = tracePlayerPathCells(
                testState,
                simPlayer.id
            )

            let score = 0

            // =========================
            // 1) SURVIVAL FIRST
            // =========================
            score += pathCells.length * 8

            if(result === "DEAD_END")
            {
                score -= 5000
            }

            const nextAfter = findCurrentPlayerNextCell(
                testState,
                simPlayer.id
            )

            if(!nextAfter)
            {
                score -= 3000
            }

            // =========================
            // 2) FUTURE MOVE COUNT
            // =========================
            const futureMoves = getValidMovesForPlayer(
                testState,
                testState.currentPlayer
            )

            score += futureMoves.length * 20

            // =========================
            // 3) LOOP PENALTY
            // =========================
            const visited = new Set<string>()

            for(const c of pathCells)
            {
                const key = `${c.x}_${c.y}`

                if(visited.has(key))
                {
                    score -= 300
                }

                visited.add(key)
            }

            // =========================
            // 4) POSITION / EDGE SAFETY
            // =========================
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

                score += distToEdge * 6

                const distToCenter =
                    Math.abs(lastCell.x - this.state.board.size / 2) +
                    Math.abs(lastCell.y - this.state.board.size / 2)

                score -= distToCenter * 2

                if(strategy === "defensive")
                {
                    score += distToEdge * 8
                    score += nextAfter ? 100 : -400
                }
                else if(strategy === "aggressive")
                {
                    score += enemies.length * 30
                }
            }

            // =========================
            // 5) ENEMY PRESSURE / BLOCK
            // =========================
            for(const enemy of enemies)
            {
                const enemyIndex = testState.players.findIndex(
                    p => p.id === enemy.id
                )

                if(enemyIndex === -1) continue

                const enemyNextCell = findCurrentPlayerNextCell(
                    testState,
                    enemy.id
                )

                if(!enemyNextCell)
                {
                    score += 800
                    continue
                }

                const enemyMoves = getValidMovesForPlayer(
                    testState,
                    enemyIndex
                )

                if(enemyMoves.length === 0)
                {
                    score += 500
                }

                if(
                    enemyNextCell.x === nextCell.x &&
                    enemyNextCell.y === nextCell.y
                )
                {
                    score += 250
                }
            }

            // =========================
            // 6) MINI MINIMAX
            // =========================
            const enemyIndex =
                (testState.currentPlayer + 1) % testState.players.length

            const enemyPlayer = testState.players[enemyIndex]

            if(enemyPlayer && enemyPlayer.isAlive !== false)
            {
                const enemyMoves = getValidMovesForPlayer(
                    testState,
                    enemyIndex
                )

                if(enemyMoves.length > 0)
                {
                    let worstCase = -999999

                    for(const emove of enemyMoves)
                    {
                        const sim2: GameState =
                        {
                            board: new BoardEngine(testState.board.size),
                            players: JSON.parse(JSON.stringify(testState.players)),
                            deck: [...testState.deck],
                            discard: [...testState.discard],
                            currentPlayer: enemyIndex
                        }

                        this.cloneBoardToState(testState, sim2)

                        const simEnemyPlayer = sim2.players[enemyIndex]

                        const enemyNext = findCurrentPlayerNextCell(
                            sim2,
                            simEnemyPlayer.id
                        )

                        if(!enemyNext)
                        {
                            continue
                        }

                        sim2.board.placeCard(
                            enemyNext.x,
                            enemyNext.y,
                            emove.cardId,
                            emove.rotation,
                            simEnemyPlayer.id
                        )

                        const enemyResult = tracePlayerPath(
                            sim2,
                            simEnemyPlayer.id
                        )

                        if(enemyResult === "OUT_OF_BOARD")
                        {
                            continue
                        }

                        const enemyPath = tracePlayerPathCells(
                            sim2,
                            simEnemyPlayer.id
                        )

                        let enemyScore = enemyPath.length * 10

                        if(enemyResult === "DEAD_END")
                        {
                            enemyScore -= 2000
                        }

                        const enemyFuture = getValidMovesForPlayer(
                            sim2,
                            enemyIndex
                        )

                        enemyScore += enemyFuture.length * 10

                        if(enemyScore > worstCase)
                        {
                            worstCase = enemyScore
                        }
                    }

                    if(worstCase !== -999999)
                    {
                        score -= worstCase * 0.7
                    }
                }
            }

            // =========================
            // 7) SMALL RANDOMNESS
            // =========================
            score += Math.random() * 5

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

private cloneBoardToState(sourceState: GameState, targetState: GameState)
{
    for(let y = 0; y < sourceState.board.size; y++)
    {
        for(let x = 0; x < sourceState.board.size; x++)
        {
            const cell = sourceState.board.getCell(x, y)

            if(cell && cell.cardId !== null && cell.owner !== null)
            {
                targetState.board.placeCard(
                    x,
                    y,
                    cell.cardId,
                    cell.rotation,
                    cell.owner
                )
            }
        }
    }
}

}