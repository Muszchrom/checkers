import { useState } from "react"

import { 
  useForm, 
  FieldValues, 
  SubmitHandler
} from "react-hook-form"
import clsx from "clsx"
import { toast } from "react-hot-toast"
import { useNavigate } from 'react-router-dom'

import Input from "../components/Input"

export default function Form() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<FieldValues>({
    defaultValues: {
      username: "",
      gameid: "",
    }
  })

  const fakeBehavior = () => {
    const x = Math.random()
    setIsLoading(true)
    setTimeout(() => {
      if (x < 0.33) toast.error("Invalid game id")
      else if (x < 0.66) toast.error("Server error")
      else {
        toast.success("Connected to the game")
        navigate('/game', {replace: true})
      }
      setIsLoading(false)
    }, 2000)
  }

  const onGameIdSubmit: SubmitHandler<FieldValues> = (data) => {
    // connect to the game
    // btw you can style toast 
    // https://react-hot-toast.com/docs/toast
    data && data // disavle that fkin TS undreline
    fakeBehavior()    
  }

  const onCreateGameSubmit: SubmitHandler<FieldValues> = (data) => {
    // create new game
    data && data
    fakeBehavior()
  }

  return (
    <div >
      <form className="flex flex-col gap-y-4" >
        
        <Input 
          id="username" 
          placeholder="Nazwa" 
          disabled={isLoading} 
          errors={errors} 
          register={register} 
          registerOptions={{required: true}}
          />
        <Input 
          id="gameid" 
          placeholder="ID Gry" 
          disabled={isLoading} 
          errors={errors} 
          register={register}
          registerOptions={{minLength: 6, maxLength: 6}}
        />
        <button 
          type="submit" 
          onClick={handleSubmit(onGameIdSubmit)} 
          className={clsx("bg-rose-600 px-3 py-2 rounded-lg", isLoading && "opacity-70")}
          disabled={isLoading}>
            Dołącz
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-rose-600"/>
          </div>
          <div
            className="
              relative
              flex
              justify-center
              text-sm
            "
          >
            <span 
              className="
                bg-zinc-900
                text-rose-600
                px-2
              "
            >Lub</span>
          </div>
        </div>

        <button 
          type="submit" 
          onClick={handleSubmit(onCreateGameSubmit)} 
          className={clsx("bg-rose-600 px-3 py-2 rounded-lg", isLoading && "opacity-70")} 
          disabled={isLoading}>
            Stwórz grę
        </button>
      </form>
    </div>
  )
}

