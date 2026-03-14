/**
 * File: BoardEngine.ts
 * Purpose: Oyun tahtasının veri modelini ve temel board işlemlerini yönetir
 */

export interface BoardCell
{
    cardId:string | null
    rotation:number
    owner:number | null
}

export default class BoardEngine
{
    board:BoardCell[][]
    size:number

    constructor(size:number)
    {
        this.size = size
        this.board = this.createBoard(size)
    }

    createBoard(size:number):BoardCell[][]
    {
        const board:BoardCell[][] = []

        for(let y=0;y<size;y++)
        {
            board[y] = []

            for(let x=0;x<size;x++)
            {
                board[y][x] =
                {
                    cardId:null,
                    rotation:0,
                    owner:null
                }
            }
        }

        return board
    }

    isInside(x:number,y:number):boolean
    {
        return x>=0 && y>=0 && x<this.size && y<this.size
    }

    isCellEmpty(x:number,y:number):boolean
    {
        if(!this.isInside(x,y)) return false

        return this.board[y][x].cardId === null
    }

    placeCard(
        x:number,
        y:number,
        cardId:string,
        rotation:number,
        owner:number
    ):void
    {
        if(!this.isInside(x,y))
        {
            throw new Error("Board dışı koordinat")
        }

        if(!this.isCellEmpty(x,y))
        {
            throw new Error("Hücre dolu")
        }

        this.board[y][x] =
        {
            cardId,
            rotation,
            owner
        }
    }

    getCell(x:number,y:number):BoardCell | null
    {
        if(!this.isInside(x,y)) return null

        return this.board[y][x]
    }

}