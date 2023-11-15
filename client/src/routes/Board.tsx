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
          color: isPieceAllowed ? "bg-zinc-900" : "bg-zinc-100",
          isKing: false
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
    
    // fields[1][3].occupiedBy = "white"
    fields[1][3].occupiedBy = "none"
    fields[6][4].occupiedBy = "none"
    fields[0][0].occupiedBy = "none"
    fields[1][1].occupiedBy = "dark"
    fields[2][2].occupiedBy = "none"
    fields[3][3].occupiedBy = "dark"

    return fields
  }

  const [fields, setFields] = useState(generateFields())
  const [whosTurn, setWhosTurn] = useState("white")
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

  const handlePieceClick2 = (nRow: number, nCol: number) => {
    if (!activePiece) {
      const x = highlightAvailableMoves(nRow, nCol, fields)
      setFields(x)
      setActivePiece([nRow, nCol])
    } if (activePiece && fields[nRow][nCol].active) {
      const delta = Math.abs(nRow-activePiece[0])
      const calcPos = (w: number, f: number, i: number) => w-(w-f)/Math.abs((w-f))*i
      for (let i=1; i<delta; i++) {
        if (fields[calcPos(activePiece[0], nRow, i)][calcPos(activePiece[1], nCol, i)].occupiedBy !== fields[activePiece[0]][activePiece[1]].occupiedBy) {
          fields[calcPos(activePiece[0], nRow, i)][calcPos(activePiece[1], nCol, i)].occupiedBy = "none"
        }
      }
      const buff = fields[nRow][nCol]
      fields[nRow][nCol] = fields[activePiece[0]][activePiece[1]]
      fields[activePiece[0]][activePiece[1]] = buff
      if (nRow === 0 || nRow === 7) fields[nRow][nCol].isKing = true
      setFields([...fields])
      setActivePiece(null)
      clearActiveFields(true)
    }
    
  }

  // function is not pure, it depends on fields state
  const highlightAvailableMoves = (nRow: number, nCol: number, fields__: Field[][]): Field[][] => {
    const fields_ = [...fields__]
    const mainField = fields[nRow][nCol]
    mainField.isKing && mainField.occupiedBy === "white" 

    // const isDirectionEnabled = [true, true, true, true] // [tl, tr, bl, br]
    

    const isDirectionEnabled = [
      mainField.isKing || mainField.occupiedBy === "white", 
      mainField.isKing || mainField.occupiedBy === "white", 
      mainField.isKing || mainField.occupiedBy === "dark", 
      mainField.isKing || mainField.occupiedBy === "dark"
    ] // [tl, tr, bl, br]

    const setFieldActive = (row: number, col: number): undefined => {
      fields_[row][col].active = true
      return undefined
    }

    const checkIsActiveAlready = (field: Field | undefined): undefined | Field => {
      return field ? (field.active ? undefined : field) : undefined 
    }

    const checkExistanceAndNone = (row: number, col: number) => {
      return !!(fields_[row] && fields_[row][col] && fields_[row][col].occupiedBy === "none")
    }

    for (let i=1; i<(mainField.isKing ? 8 : 2); i++) {
      let tl: Field | undefined = isDirectionEnabled[0] ? fields_[nRow - i] && fields_[nRow - i][nCol - i] : undefined
      let tr: Field | undefined = isDirectionEnabled[1] ? fields_[nRow - i] && fields_[nRow - i][nCol + i] : undefined
      let bl: Field | undefined = isDirectionEnabled[2] ? fields_[nRow + i] && fields_[nRow + i][nCol - i] : undefined
      let br: Field | undefined = isDirectionEnabled[3] ? fields_[nRow + i] && fields_[nRow + i][nCol + i] : undefined

      tl = checkIsActiveAlready(tl)
      tr = checkIsActiveAlready(tr)
      bl = checkIsActiveAlready(bl)
      br = checkIsActiveAlready(br)

      // if field empty
      if (tl && tl.occupiedBy === "none") tl = setFieldActive(nRow - i, nCol - i)
      if (tr && tr.occupiedBy === "none") tr = setFieldActive(nRow - i, nCol + i)
      if (bl && bl.occupiedBy === "none") bl = setFieldActive(nRow + i, nCol - i)
      if (br && br.occupiedBy === "none") br = setFieldActive(nRow + i, nCol + i)

      // if same color
      if (tl && tl.occupiedBy === mainField.occupiedBy) {tl = undefined; isDirectionEnabled[0] = false} // same color
      if (tr && tr.occupiedBy === mainField.occupiedBy) {tr = undefined; isDirectionEnabled[1] = false}
      if (bl && bl.occupiedBy === mainField.occupiedBy) {bl = undefined; isDirectionEnabled[2] = false}
      if (br && br.occupiedBy === mainField.occupiedBy) {br = undefined; isDirectionEnabled[3] = false}



      if (
        i === 1 &&
        fields_[nRow-i] && 
        fields_[nRow-i][nCol-i] &&
        fields_[nRow-i][nCol-i].occupiedBy !== mainField.occupiedBy &&
        fields_[nRow-i][nCol-i].occupiedBy !== "none" &&
        fields_[nRow-i-1] && 
        fields_[nRow-i-1][nCol-i-1] && 
        fields_[nRow-i-1][nCol-i-1].occupiedBy === "none"
      ) tl = setFieldActive(nRow - i-1, nCol - i-1)
      if (
        i === 1 &&
        fields_[nRow - i] && 
        fields_[nRow - i][nCol + i] && 
        fields_[nRow - i][nCol + i].occupiedBy !== mainField.occupiedBy &&
        fields_[nRow - i][nCol + i].occupiedBy !== "none" &&
        fields_[nRow-i-1] && 
        fields_[nRow-i-1][nCol+i+1] && 
        fields_[nRow-i-1][nCol+i+1].occupiedBy === "none"
      ) tr = setFieldActive(nRow - i-1, nCol + i+1)
      if (
        i === 1 &&
        fields_[nRow + i] && 
        fields_[nRow + i][nCol - i] && 
        fields_[nRow + i][nCol - i].occupiedBy !== mainField.occupiedBy &&
        fields_[nRow + i][nCol - i].occupiedBy !== "none" &&
        fields_[nRow+i+1] && 
        fields_[nRow+i+1][nCol-i-1] && 
        fields_[nRow+i+1][nCol-i-1].occupiedBy === "none"
      ) bl = setFieldActive(nRow + i+1, nCol - i-1)
      if (
        i === 1 &&
        fields_[nRow+i] && 
        fields_[nRow+i][nCol+i] &&
        fields_[nRow+i][nCol+i].occupiedBy !== mainField.occupiedBy &&
        fields_[nRow+i][nCol+i].occupiedBy !== "none" &&
        fields_[nRow+i+1] && 
        fields_[nRow+i+1][nCol+i+1] && 
        fields_[nRow+i+1][nCol+i+1].occupiedBy === "none"
      ) br = setFieldActive(nRow + i+1, nCol + i+1)



      if (
        tl &&
        tl.occupiedBy !== mainField.occupiedBy &&
        fields_[nRow-i-1] && 
        fields_[nRow-i-1][nCol-i-1] && 
        fields_[nRow-i-1][nCol-i-1].occupiedBy !== "none"
      ) {tl = undefined; isDirectionEnabled[0] = false}
      if (
        tr &&
        tr.occupiedBy !== mainField.occupiedBy &&
        fields_[nRow-i-1] && 
        fields_[nRow-i-1][nCol+i+1] && 
        fields_[nRow-i-1][nCol+i+1].occupiedBy !== "none"
      ) {tr = undefined; isDirectionEnabled[1] = false}
      if (
        bl &&
        bl.occupiedBy !== mainField.occupiedBy &&
        fields_[nRow+i+1] && 
        fields_[nRow+i+1][nCol-i-1] && 
        fields_[nRow+i+1][nCol-i-1].occupiedBy !== "none"
      ) {bl = undefined; isDirectionEnabled[2] = false}
      if (
        br &&
        br.occupiedBy !== mainField.occupiedBy &&
        fields_[nRow+i+1] && 
        fields_[nRow+i+1][nCol+i+1] && 
        fields_[nRow+i+1][nCol+i+1].occupiedBy !== "none"
      ) {br = undefined; isDirectionEnabled[3] = false}

      // if (tl && tl.occupiedBy !== fields_[nRow][nCol].occupiedBy && checkExistanceAndNone(-i-1, -i-1)) tl = setFieldActive(nRow - i-1, nCol - i-1)
      // if (tr && tr.occupiedBy !== fields_[nRow][nCol].occupiedBy && checkExistanceAndNone(-i-1, i+1)) tr = setFieldActive(nRow - i-1, nCol + i+1)
      // if (bl && bl.occupiedBy !== fields_[nRow][nCol].occupiedBy && checkExistanceAndNone(i+1, -i-1)) bl = setFieldActive(nRow + i+1, nCol - i-1)
      // if (br && br.occupiedBy !== fields_[nRow][nCol].occupiedBy && checkExistanceAndNone(i+1, i+1)) br = setFieldActive(nRow + i+1, nCol + i+1)
    }
    return fields_
  }
  
  return (
    <>
    <div className="min-w-[256px] w-[90vw] max-w-[90vh]">
      <div 
        className="bg-rose-600 aspect-square rounded-lg w-full max-w-[800px] grid grid-rows-8 grid-cols-8 flex-wrap p-4" >
          {fields.map((rows, nRow) => {
            return rows.map((field, nCol) => {
              // check if player wants to move then check if current field is the clicked field

              return (
                <div 
                  onClick={() => handlePieceClick2(nRow, nCol)} 
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
    <button onClick={() => setFields(generateFields())}>Restart stuff</button>
    </>
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