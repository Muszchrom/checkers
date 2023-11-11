import clsx from "clsx"

interface PieceProps {
  color?: "dark"
}

const Piece: React.FC<PieceProps> = ({color}) => {
  return (
    <div className={clsx("ring-2 ring-rose-600 rounded-full shadow-[inset_0_0px_3px_3px_rgba(225,29,72,0.3)] w-2/3 h-2/3", color ? "bg-zinc-900" : "bg-zinc-100")}>
{/* rgba(225, 29, 72, 0.3) */}
    </div>
  )
}

export default Piece