import clsx from "clsx"

import King from "./King"

interface PieceProps {
  color?: "dark",
  isKing?: boolean
}

const Piece: React.FC<PieceProps> = ({color, isKing}) => {
  return (
    <div className={clsx("p-2 ring-2 ring-rose-600 rounded-full shadow-[inset_0_0px_3px_3px_rgba(225,29,72,0.3)] w-2/3 h-2/3 text-4xl flex justify-center items-center", color ? "bg-zinc-900" : "bg-zinc-100")}>
      {!!isKing && <King className="stroke-rose-600 fill-rose-600 w-full h-full stroke-1"/>}
    </div>
  )
}

export default Piece