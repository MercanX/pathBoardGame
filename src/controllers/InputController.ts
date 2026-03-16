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
import { getValidMovesForPlayer } from "../core/RuleEngine"
import { findCurrentPlayerNextCell } from "../core/PathEngine"

export default class InputController
{
    scene: Phaser.Scene

    constructor(
        scene: Phaser.Scene,
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
        private setGhost:(g:Phaser.GameObjects.Image)=>void,
        private getHighlight:()=>Phaser.GameObjects.Rectangle | undefined,
        private setHighlight:(h:Phaser.GameObjects.Rectangle)=>void,
        private getPathPreview:()=>Phaser.GameObjects.Graphics | undefined,
        private setPathPreview:(p:Phaser.GameObjects.Graphics | undefined)=>void
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

        //this.scene.input.on("pointermove", this.handleMove, this)

        this.scene.input.on(
            "pointerdown",
            handleClick,
            this.scene
        )
    }


handleMove(pointer: Phaser.Input.Pointer)
{
    const cell = this.getBoardCellFromPointer(pointer)

    if(!cell)
    {
        this.boardView.clearGhostOverlays()

        const ghost = this.getGhost()
        if(ghost)
        {
            ghost.setVisible(false)
        }

        const highlight = this.getHighlight()
        if(highlight)
        {
            highlight.setVisible(false)
        }

        return
    }

    const selectedCard = this.handView.getSelectedCard()

    if(!selectedCard)
    {
        this.boardView.clearGhostOverlays()

        const ghost = this.getGhost()
        if(ghost)
        {
            ghost.setVisible(false)
        }

        const highlight = this.getHighlight()
        if(highlight)
        {
            highlight.setVisible(false)
        }

        return
    }

    const center = this.getCellCenter(cell.x, cell.y)

    let highlight = this.getHighlight()

    if(!highlight)
    {
        highlight = this.scene.add.rectangle(
            center.x,
            center.y,
            this.getCellSize() - 6,
            this.getCellSize() - 6
        )

        highlight.setStrokeStyle(4, 0xffffff, 0.9)
        highlight.setFillStyle(0x000000, 0)
        highlight.setDepth(150)
        highlight.setVisible(false)

        this.boardLayer.add(highlight)

        this.setHighlight(highlight)
    }
    else
    {
        highlight.setPosition(center.x, center.y)
    }

    let ghost = this.getGhost()

    if(!ghost)
    {
        ghost = this.scene.add.image(center.x, center.y, selectedCard)

        ghost.setDisplaySize(
            this.getCellSize() - 4,
            this.getCellSize() - 4
        )

        ghost.setDepth(200)

        this.boardLayer.add(ghost)

        this.setGhost(ghost)
    }
    else
    {
        ghost.setTexture(selectedCard)
        ghost.setPosition(center.x, center.y)
        ghost.setVisible(true)
    }

    ghost.setRotation(this.getRotation() * Math.PI / 2)

    ghost.clearTint()

    const state = this.gameEngine.getState()
    if(!state) return

    const player = state.players[state.currentPlayer]

    const validMoves = getValidMovesForPlayer(
        state,
        state.currentPlayer
    )

    const isAllowedCard = validMoves.some(v =>
        v.cardId === selectedCard &&
        v.rotation === this.getRotation()
    )

    const nextCell = findCurrentPlayerNextCell(state, player.id)

    const pathPreview = this.getPathPreview()

    if(pathPreview)
    {
        pathPreview.destroy()
        this.setPathPreview(undefined)
    }

    if(
        nextCell &&
        nextCell.x === cell.x &&
        nextCell.y === cell.y &&
        state.board.board[cell.y][cell.x].cardId === null
    )
    {
        this.boardView.renderGhostPath(
            selectedCard,
            this.getRotation(),
            cell.x,
            cell.y
        )
    }
    else
    {
        this.boardView.clearGhostOverlays()
    }

    if(
        nextCell &&
        nextCell.x === cell.x &&
        nextCell.y === cell.y &&
        state.board.board[cell.y][cell.x].cardId === null
    )
    {
        highlight.setVisible(true)
        ghost.setAlpha(1)

        if(isAllowedCard)
        {
            highlight.setStrokeStyle(20, 0x22c55e, 0.5)
            highlight.setFillStyle(0x22c55e, 0.5)
        }
        else
        {
            highlight.setStrokeStyle(20, 0xef4444, 0.5)
            highlight.setFillStyle(0xef4444, 0.5)
        }
    }
    else
    {
        highlight.setVisible(false)
        ghost.setAlpha(0.5)
    }
}

}