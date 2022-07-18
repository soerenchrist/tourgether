import { ChangeEventHandler, FocusEventHandler, forwardRef } from "react";

type Props = {
  id: string;
  label?: string;
  placeholder?: string;
  value?: string;
  className?: string;
  disabled?: boolean;
  step?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  error?: string;
  autoComplete?: string;
  type?: "text" | "date" | "datetime" | "time" | "number"
};


const Input: React.FC<Props> =
  forwardRef<HTMLInputElement, Props>((props, ref) => {
    
    const inputClasses = props.error
    ? "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500"
    : "bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  
    return (
      <div>
        {props.label && (
          <label
            htmlFor={props.id}
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            {props.label}
          </label>
        )}
        <input
          ref={ref}
          {...props}
          className={`${inputClasses}  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:focus:ring-blue-500 dark:focus:border-blue-500`}
        />
        {props.error && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{props.error}</p>}
      </div>
    );
    
  })

Input.displayName = "Input";
export default Input;
