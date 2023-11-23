import Piece from "../components/boardAssets/Piece"
import { useState } from "react"

export default function Board() {
  // color is replaced by formula 
  // row_id + col_id % 2 == 1 ? "White" : "Black"
  // that's why type BoardType exist
  // renamed dark to black because colors are easier than shades
  type Field = {
    occupiedBy: "none" | "white" | "black"
    active: boolean
    isKing: boolean
  }
  type BoardType = Field[][]

  const generateFields = (): BoardType => {
    const fields: BoardType = []
    let buff: Field[] = []

    for (let row=0; row<8; row++) {
      const isRowEven = row % 2
      
      for (let col=0; col<8; col++) {
        const isPieceAllowed = isRowEven ? col%2 : !(col%2)
        
        buff.push({
          occupiedBy: isPieceAllowed ? (row < 3 ? "black" : row > 4 ? "white" : "none") : "none",
          active: false,
          isKing: false
        })
      }
      fields.push(buff)
      buff = []
    }
    return fields
  }

  const [fields, setFields] = useState<BoardType>(generateFields())  // Board state
  const [whosTurn, setWhosTurn] = useState<"white" | "black">("white")  // tracking turns
  const [activePiece, setActivePiece] = useState<[number, number] | null>(null)  // [row, col] of currently active piece or null, when there's no selected piece
  const [pieceCounter, setPieceCounter] = useState({white: 12, black: 12})

  // set all Field.active to false, optionally update the state 
  const clearActiveFields = (updateState?: boolean): void => {
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

  // basically handle piece selection and movement 
  // movement must be checked on server, since it is easily hackable
  const handlePieceClick2 = (nRow: number, nCol: number): void => {
    if (!activePiece) {
      // if field is not yours return void
      if (fields[nRow][nCol].occupiedBy !== whosTurn) {
        return 
      }
      // highlight available moves and save active piece in the state
      setFields(highlightAvailableMoves(nRow, nCol, fields))
      setActivePiece([nRow, nCol])
    } 
    
    if (activePiece && fields[nRow][nCol].active) {
      const calcPos = (w: number, f: number, i: number) => w-(w-f)/Math.abs((w-f))*i
      
      const distance = Math.abs(nRow-activePiece[0])
      let nextTurn: "white" | "black" = whosTurn === "white" ? "black" : "white"
      
      // remove active styles when active piece is clicked
      if (distance === 0) {
        return clearActiveFields(true)
      }
      
      // remove enemy pieces
      for (let i=1; i<distance; i++) {
        const row = calcPos(activePiece[0], nRow, i)
        const col = calcPos(activePiece[1], nCol, i)
        if (
          fields[row][col].occupiedBy !== fields[activePiece[0]][activePiece[1]].occupiedBy &&
          fields[row][col].occupiedBy !== "none"
        ) {
          fields[row][col].occupiedBy = "none"
          fields[row][col].isKing = false
          if (whosTurn === "white") {
            pieceCounter.black -= 1
            nextTurn = "white"
          } else {
            pieceCounter.white -= 1
            nextTurn = "black"
          }
        }
      }

      // swap currently active piece with destination 
      const buff = fields[nRow][nCol]
      fields[nRow][nCol] = fields[activePiece[0]][activePiece[1]]
      fields[activePiece[0]][activePiece[1]] = buff

      // make piece a king, when conditions are met
      if (nRow === 0 && fields[nRow][nCol].occupiedBy === "white" || nRow === 7 && fields[nRow][nCol].occupiedBy === "black") {
        fields[nRow][nCol].isKing = true
      }

      setWhosTurn(nextTurn)
      setFields([...fields])
      setActivePiece(null)
      clearActiveFields(true)
      setPieceCounter({...pieceCounter})
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
      mainField.isKing || mainField.occupiedBy === "black", 
      mainField.isKing || mainField.occupiedBy === "black"
    ] // [tl, tr, bl, br]

    const setFieldActive = (row: number, col: number): undefined => {
      fields_[row][col].active = true
      return undefined
    }

    const checkIsActiveAlready = (field: Field | undefined): undefined | Field => {
      return field ? (field.active ? undefined : field) : undefined 
    }

    setFieldActive(nRow, nCol)

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
    }
    return fields_
  }
  
  return (
    <>
    <h1 className="text-rose-600 text-7xl mb-5">{whosTurn === "white" ? "White" : "Dark"}</h1>
    <div className="min-w-[256px] w-[90vw] max-w-[90vh] flex justify-center">
      <div 
        className="bg-rose-600 aspect-square rounded-lg w-full max-w-[800px] grid grid-rows-8 grid-cols-8 flex-wrap p-4" >
          {fields.map((rows, nRow) => {
            return rows.map((field, nCol) => {
              // check if player wants to move then check if current field is the clicked field

              return (
                <div 
                  onClick={() => handlePieceClick2(nRow, nCol)} 
                  key={nRow + nCol} 
                  className={`flex justify-center items-center relative ${(nRow + nCol) % 2 === 1 ? "bg-zinc-100" : "bg-zinc-900"}`}
                >
                  {field.active ?
                    <FieldActive>
                      {field.occupiedBy !== "none" && (field.occupiedBy === "black" ? <Piece color="dark" isKing={field.isKing}/> : <Piece isKing={field.isKing}/>) }
                    </FieldActive>
                    : 
                    <>
                      {field.occupiedBy !== "none" && (field.occupiedBy === "black" ? <Piece color="dark" isKing={field.isKing}/> : <Piece isKing={field.isKing} />) }
                    </>
                  }
                </div>
              )
            })
          })}
      </div>
    </div>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <div className="flex flex-col items-start justify-center gap-5">
    <button className="bg-rose-600 rounded-md px-4 py-2" onClick={() => setFields(generateFields())}>Restart stuff</button>
    <button className="bg-rose-600 rounded-md px-4 py-2" onClick={() => setWhosTurn(whosTurn === "black" ? "white" : "black")}>Toggle turn</button>
    </div>
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