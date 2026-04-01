/**
 * File: src/controllers/InputController.ts
 * File Name: InputController.ts
 * Purpose: Oyun input sistemini yönetir.
 * Usage:
 * - Mouse hareketleri
 * - Kart yerleştirme
 * - Board hover işlemleri
 * Notes:
 * - GameScene içindeki input logic buraya taşınmaktadır
 */

import Phaser from "phaser"
import { canPlace, getValidMovesForPlayer } from "../core/RuleEngine"
import {
    findCurrentPlayerNextCell,
    tracePlayerPathCells
} from "../core/PathEngine"

import GameScene from "../scenes/GameScene"
import { GameConfig } from "../config/GameConfig"

export default class InputController
{
    scene: GameScene

    constructor(
        scene: GameScene,
        private boardView:any,
        private handView:any,
        private gameEngine:any,
        private boardLayer:Phaser.GameObjects.Container,
        private getBoardCellFromPointer:(pointer:Phaser.Input.Pointer)=>any,
        private getCellCenter:(x:number,y:number)=>{x:number,y:number},
        private getCellSize:()=>number,
        private getRotation:()=>number,
        private setRotation:(r:number)=>void,
        private getGhost:()=>Phaser.GameObjects.Image | undefined,
        private setGhost:(g:Phaser.GameObjects.Image | undefined)=>void,
        private getHighlight:()=>Phaser.GameObjects.Rectangle | undefined,
        private setHighlight:(h:Phaser.GameObjects.Rectangle)=>void,
        private getPathPreview:()=>Phaser.GameObjects.Graphics | undefined,
        private setPathPreview:(p:Phaser.GameObjects.Graphics | undefined)=>void,
        private isDragging:()=>boolean,
        private focusBoardCell:(x:number,y:number,animate?:boolean)=>void,
        private checkBotTurn:()=>void
    )
    {
        this.scene = scene
    }

    setupInput(
        handleClick:(pointer:Phaser.Input.Pointer)=>void,
        toggleMapMode:()=>void,
        getCurrentRotation:()=>number,
        setRotation:(rotation:number)=>void,
        getGhostCard:()=>Phaser.GameObjects.Image | undefined
    )
    {
        this.scene.input.keyboard?.on("keydown-R", () => {

            const newRotation = (getCurrentRotation() + 1) % 4
            setRotation(newRotation)

            const ghost = getGhostCard()

            if(ghost)
            {
                ghost.setRotation(newRotation * Math.PI / 2)
            }
        })

        this.scene.input.keyboard?.on("keydown-M", () => {
            toggleMapMode()
        })

        this.scene.input.on(
            "pointerdown",
            handleClick,
            this.scene
        )
    }

handleClick(pointer: Phaser.Input.Pointer)
{
    if(this.scene.isGameOver) return

    if(this.isDragging()) return

    const cell = this.getBoardCellFromPointer(pointer)
    if(!cell) return

    const state = this.gameEngine.getState()
    if(!state) return

    const actingPlayer = state.players[state.currentPlayer]

    const selectedCard = this.handView.getSelectedCard()
    if(!selectedCard) return

    const validMoves = getValidMovesForPlayer(
        state,
        state.currentPlayer
    )

    if(GameConfig.DEBUG)
    {

    console.log("VALID MOVES:", validMoves)
    console.log("SELECTED CARD:", selectedCard)
    console.log("ROTATION:", this.getRotation())
    }

    if(validMoves.length === 0)
    {
        console.log("NO VALID CARDS")
        return
    }

    // 1) önce kart + rotasyon doğru mu?
    const isAllowedCard = validMoves.some(v =>
        v.cardId === selectedCard &&
        v.rotation === this.getRotation()
    )

    if(!isAllowedCard)
    {
        console.log("CARD DOES NOT MATCH PATH")
        return
    }

    // 2) sonra doğru next cell mi?
    const nextCell = findCurrentPlayerNextCell(state, actingPlayer.id)



    if(!nextCell)
    {
        console.log("NO NEXT CELL")
        return
    }

    
    const isCorrectCell =
        cell.x === nextCell.x &&
        cell.y === nextCell.y




    if(!isCorrectCell)
    {
        console.log("NOT NEXT CELL")
        return
    }

    // 3) hücre boş mu?
    if(!canPlace(state.board.board, cell.x, cell.y))
    {
        console.log("INVALID MOVE")
        return
    }

    try
    {
        this.gameEngine.playCard(
            selectedCard,
            cell.x,
            cell.y,
            this.getRotation()
        )

        this.scene.checkGameOver()

        if(this.scene.isGameOver)
        {
            return
        }
        (this.scene as any).hint.onPlace()
        // sonra bot
        this.checkBotTurn()

        this.scene.time.delayedCall(800, () => {
            (this.scene as any).hint.onBotPlayed((this.scene as any).btnMap)
        })

        const newState = this.gameEngine.getState()

        let focusX = cell.x
        let focusY = cell.y

        if(newState)
        {
            const nextCellAfterMove = findCurrentPlayerNextCell(
                newState,
                newState.players[newState.currentPlayer].id
            )

            if(nextCellAfterMove)
            {
                focusX = nextCellAfterMove.x
                focusY = nextCellAfterMove.y
            }

            const nextCellForRender = nextCellAfterMove
                ? { x: nextCellAfterMove.x, y: nextCellAfterMove.y }
                : undefined

            this.boardView.render(nextCellForRender)

// ======================
// 🔥 IMPACT EFFECT (DOĞRU YER)
// ======================
const center = this.getCellCenter(cell.x, cell.y)

const circle = this.scene.add.circle(
    center.x,
    center.y,
    10,
    0xffffff,
    0.5
)

this.scene.boardLayer.add(circle)

this.scene.tweens.add({
    targets: circle,
    scale: 3,
    alpha: 0,
    duration: 300,
    ease: "Cubic.easeOut",
    onComplete: () => circle.destroy()
})

const flash = this.scene.add.rectangle(
    center.x,
    center.y,
    this.getCellSize(),
    this.getCellSize(),
    0xffffff,
    0.4
)

this.scene.boardLayer.add(flash)

this.scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 150,
    ease: "Quad.easeOut",
    onComplete: () => flash.destroy()
})

this.scene.cameras.main.shake(120, 0.003)




            /*
            const validMoves = getValidMovesForPlayer(
                newState,
                newState.currentPlayer
            )

            const validCardIds = new Set(
                validMoves.map(v => v.cardId)
            )

            this.handView.render(validCardIds)
            */
        }

        const ghost = this.getGhost()
        if(ghost)
        {
            this.scene.clearGhostObjects()
        }

        this.scene.time.delayedCall(1000, () => {
            this.focusBoardCell(focusX, focusY, true)
        })

        if(newState)
        {
            const currentPlayerAfterMove =
                newState.players[newState.currentPlayer]

            const flows = tracePlayerPathCells(
                newState,
                currentPlayerAfterMove.id
            )
            
            if(GameConfig.DEBUG)
            {
                console.log("===== TRACE AFTER MOVE =====")
                console.table(flows)
            }
        }
    }
    catch(error)
    {
        console.log("Invalid move", error)
    }
}


}