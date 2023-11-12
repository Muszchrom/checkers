import Piece from "../components/boardAssets/Piece"
import { useState } from "react"

export default function Board() {
  type Field = {
    occupiedBy: "none" | "white" | "dark"
    color: "bg-zinc-900" | "bg-zinc-100"
    active?: boolean
    isKing?: boolean
  }
  const generateFields = () => {
    const fields: Field[][] = []
    let buff: Field[] = []

    for (let row=0; row<8; row++) {
      const isRowEven = row % 2
      
      for (let col=0; col<8; col++) {
        const isPieceAllowed = isRowEven ? col%2 : !(col%2)
        
        buff.push({
          occupiedBy: isPieceAllowed ? (row < 3 ? "dark" : row > 4 ? "white" : "none") : "none",
          color: isPieceAllowed ? "bg-zinc-900" : "bg-zinc-100"
        })
      }
      fields.push(buff)
      buff = []
    }

    // temp movement simulation
    fields[3][5].occupiedBy = "dark"
    fields[2][4].occupiedBy = "none"
    fields[2][4].occupiedBy = "white"
    // fields[2][4].isKing = true
    // fields[4][6].occupiedBy = "white"
    fields[5][7].occupiedBy = "none"
    fields[0][2].occupiedBy = "none"

    fields[1][3].occupiedBy = "none"

    return fields
  }

  const [fields, setFields] = useState(generateFields())
  const [activePiece, setActivePiece] = useState<[number, number] | null>(null)
  
  const clearActiveFields = (updateState?: boolean) => {
    for (let i=0; i<8; i++) {
      for (let j=0; j<8; j++) {
        fields[i][j].active = false
      }
    }
    if (updateState) {
      setFields([...fields])
      setActivePiece(null)
    }
  }

  const handlePieceClick = (row: number, col: number) => {
    // Move logic
    if (fields[row][col].active) {
      if (!activePiece) return // this should never happend

      // if delta = 1 player wants to only move
      const delta = Math.abs(row-activePiece[0])

      const calcPos = (w: number, f: number, i: number) => w-(w-f)/Math.abs((w-f))*i
      for (let i=1; i<delta; i++) {
        if (fields[calcPos(activePiece[0], row, i)][calcPos(activePiece[1], col, i)].occupiedBy === "dark") {
          fields[calcPos(activePiece[0], row, i)][calcPos(activePiece[1], col, i)].occupiedBy = "none"
        }
      }
      fields[row][col].occupiedBy = "white"
      fields[row][col].isKing = fields[activePiece[0]][activePiece[1]].isKing
      fields[activePiece[0]][activePiece[1]].occupiedBy = "none"
      fields[activePiece[0]][activePiece[1]].isKing = false
      if (row === 0) fields[row][col].isKing = true
      clearActiveFields()
      setFields([...fields])
      setActivePiece(null)
      return
    }

    // disable highlight when clicked field is not occupied by white Piece
    if (fields[row][col].occupiedBy !== "white") return clearActiveFields(true)
    if (activePiece) clearActiveFields(true)

    // set clicked Piece to white
    fields[row][col].active = true


    // Normal Piece logic
    // white Piece is clicked
    if (!fields[row][col].isKing) {
      // if row above exist
      if (fields[row-1]) {
        // check if field above to the left exist
        if (fields[row-1][col-1]) {
          // if field is empty, highlight it
          if (fields[row-1][col-1].occupiedBy === "none") { 
            fields[row-1][col-1].active = true
          }
          // if field is occupied by enemy and the next one is empty
          else if (
            fields[row-2] &&
            fields[row-1][col-1].occupiedBy === "dark" &&
            fields[row-2][col-2]?.occupiedBy === "none"
          ) {
            fields[row-2][col-2].active = true
          }
        }
        // check if fields above to the right exist
        if (fields[row-1][col+1]) {
          // if field is empty, highlight it
          if (fields[row-1][col+1].occupiedBy === "none") {
            fields[row-1][col+1].active = true
          }
          // if field is occupied by enemy
          else if (
            fields[row-2] && 
            fields[row-1][col+1].occupiedBy === "dark" && 
            fields[row-2][col+2]?.occupiedBy === "none"
          ) {
            // if the next field diagonaly placed to the current active Piece and enemey Piece is empty 
            fields[row-2][col+2].active = true
          }
        }
      } 

      // if row below exist
      // since you can only move to the top 
      // only hop over mechanic is implemented
      if (fields[row+1] && fields[row+2]) {
        // check if you can hop over
        if (fields[row+1][col-1]?.occupiedBy === "dark" && fields[row+2][col-2]?.occupiedBy === "none") {
          fields[row+2][col-2].active = true
        }
        if (fields[row+1][col+1]?.occupiedBy === "dark" && fields[row+2][col+2]?.occupiedBy === "none") {
          fields[row+2][col+2].active = true
        }
      }
    } else {
      let tl = true
      let tr = true
      let bl = true
      let br = true
      for (let i=1; i < 8; i++) {
        
        if (!fields[row-i]) {
          tl = false 
          tr = false
        }
        if (!fields[row+i]) {
          bl = false 
          br = false
        }
        if (!fields[0][col-i]) {
          tl = false
          bl = false
        }
        if (!fields[0][col+i]) {
          tr = false
          br = false
        }
        if (!(tl || tr || bl || br)) break 

        if (tl) {
          if (!fields[row-i][col-i]) tl = false
          else if (fields[row-i][col-i].occupiedBy === "none") fields[row-i][col-i].active = true
          else if (
            fields[row-(i+1)] && 
            fields[row-(i+1)][col-(i+1)] &&
            fields[row-i][col-i].occupiedBy === "dark" &&
            fields[row-(i+1)][col-(i+1)].occupiedBy === "none" 
          ) {
            fields[row-(i+1)][col-(i+1)].active = true
          } else {
            tl = false
          }
        }

        if (tr) {
          if (!fields[row-i][col+i]) tr = false
          else if (fields[row-i][col+i].occupiedBy === "none") fields[row-i][col+i].active = true
          else if (
            fields[row-(i+1)] &&
            fields[row-(i+1)][col+(i+1)] &&
            fields[row-i][col+i].occupiedBy === "dark" &&
            fields[row-(i+1)][col+(i+1)].occupiedBy === "none"
          ) {
            fields[row-(i+1)][col+(i+1)].active = true
          } else {
            tr = false
          }
        }

        if (bl) {
          if (!fields[row+i][col-i]) bl = false
          else if (fields[row+i][col-i].occupiedBy === "none") fields[row+i][col-i].active = true
          else if (
            fields[row+(i+1)] && 
            fields[row+(i+1)][col-(i+1)] &&
            fields[row+i][col-i].occupiedBy === "dark" &&
            fields[row+(i+1)][col-(i+1)].occupiedBy === "none" 
          ) {
            fields[row+(i+1)][col-(i+1)].active = true
          } else {
            bl = false
          }
        }

        if (br) {
          if (!fields[row+i][col+i]) br = false
          else if (fields[row+i][col+i].occupiedBy === "none") fields[row+i][col+i].active = true
          else if (
            fields[row+(i+1)] &&
            fields[row+(i+1)][col+(i+1)] &&
            fields[row+i][col+i].occupiedBy === "dark" &&
            fields[row+(i+1)][col+(i+1)].occupiedBy === "none"
          ) {
            fields[row+(i+1)][col+(i+1)].active = true
          } else {
            br = false
          }
        }
      }
    }
    // King Piece logic

    setFields([...fields])
    setActivePiece([row, col])
  }

  
  return (
    <div className="min-w-[256px] w-[90vw] max-w-[90vh]">
      <div 
        className="bg-rose-600 aspect-square rounded-lg w-full max-w-[800px] grid grid-rows-8 grid-cols-8 flex-wrap p-4" >
          {fields.map((rows, nRow) => {
            return rows.map((field, nCol) => {
              // check if player wants to move then check if current field is the clicked field

              return (
                <div 
                  onClick={() => handlePieceClick(nRow, nCol)} 
                  key={nRow + nCol} 
                  className={`flex justify-center items-center relative ${field.color}`}
                >
                  {field.active ?
                    <FieldActive>
                      {field.occupiedBy !== "none" && (field.occupiedBy === "dark" ? <Piece color="dark"/> : <Piece />) }
                    </FieldActive>
                    : 
                    <>
                      {field.occupiedBy !== "none" && (field.occupiedBy === "dark" ? <Piece color="dark"/> : <Piece />) }
                    </>
                  }
                </div>
              )
            })
          })}
      </div>
    </div>
  )
}

const FieldActive = ({children}: {children: React.ReactNode}) => {
  return (
    <div 
      className="
        w-full 
        h-full 
        ring-2 
        ring-rose-600 
        bg-rose-600 
        bg-opacity-30 
        absolute
        z-[1]
        flex
        items-center
        justify-center
      "
    >
      {children}
    </div>
  )
}