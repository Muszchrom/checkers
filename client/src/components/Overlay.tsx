interface OverlayProps {
  children: React.ReactNode
  buttonText: string
  buttonAction: () => void
  buttonText2?: string
  buttonAction2?: () => void
}
const Overlay: React.FC<OverlayProps> = ({children, buttonText, buttonAction, buttonText2, buttonAction2}) => {
  return (
    <div className="absolute z-10 top-0 right-0 bottom-0 left-0 bg-opacity-50 bg-zinc-900 flex justify-center items-center">
      <div className="flex flex-col w-fit gap-4 overlay-inner-shadow">
        <h1 className="text-4xl font-bold h1-shadow">{children}</h1>
        <button 
          type="submit" 
          onClick={() => buttonAction()} 
          className={"bg-rose-600 px-3 py-2 rounded-lg"}>
            {buttonText}
        </button>
        {buttonAction2 && buttonText2 && (
          <button 
            type="submit" 
            onClick={() => buttonAction2()} 
            className={"bg-rose-600 px-3 py-2 rounded-lg"}>
              {buttonText2}
          </button>
        )}
      </div>
    </div>
  )
}

export default Overlay