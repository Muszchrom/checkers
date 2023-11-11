import { UseFormRegister, RegisterOptions, FieldValues, FieldErrors } from "react-hook-form"
import clsx from "clsx"

interface InputProps {
  placeholder: string
  id: string
  disabled?: boolean
  errors: FieldErrors
  register: UseFormRegister<FieldValues>
  registerOptions: RegisterOptions
}

const Input: React.FC<InputProps> = ({id, placeholder, disabled, errors, register, registerOptions}) => {
  console.log(errors)
  console.log(id, "!!!!!!!!!!", errors[id])
  return (
    <input 
      id={id}
      type="text"
      disabled={disabled}
      placeholder={placeholder}
      {...register(id, registerOptions)}
      className={clsx(`
        rounded-lg 
        py-2 
        px-3 
        placeholder-zinc-500
        focus:ring-2
        focus:ring-inset
        bg-zinc-800 
        outline-none`,
        errors[id] ? "focus:ring-rose-500" : "focus:ring-zinc-100",
        disabled && "opacity-50"
      )} 
    />
  )
}

export default Input