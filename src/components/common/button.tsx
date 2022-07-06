import { MouseEventHandler, ReactNode } from "react"

type Props = {
    children?: ReactNode
    disabled?: boolean
    type?: "button" | "submit" | "reset"
    onClick?: MouseEventHandler<HTMLButtonElement>
}

const Button = ({ children, type, disabled, onClick }: Props) => {
    const disabledStyles = "text-white bg-blue-400 dark:bg-blue-500 cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 text-center";
    const defaultStyles = "mt-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800";

    return (


        <button
            className={`${disabled ? disabledStyles : defaultStyles}`}
            type={type}
            onClick={onClick}
            disabled={disabled}>
            {children}
        </button>
    )
}

export default Button;