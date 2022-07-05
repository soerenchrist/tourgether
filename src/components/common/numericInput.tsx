import { ChangeEventHandler, FocusEventHandler } from "react";

type Props = {
  id: string;
  label?: string;
  placeholder?: string;
  value?: number;
  onChange?: (val: number | undefined) => void;
  onFocus?: FocusEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  error?: string;
};

const NumericInput: React.FC<Props> = ({ id, label, placeholder, error, value, onChange, onFocus, onBlur }) => {
  const inputClasses = error
    ? "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500"
    : "bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!onChange) return

    const numericValue = parseFloat(event.target.value);
    if (isNaN(numericValue))  {
      error = "The value should be numeric";
      onChange(undefined);
      return;
    }

    onChange(numericValue);
  }

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        type="number"
        id={id}
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={handleChange}
        className={`${inputClasses}  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:focus:ring-blue-500 dark:focus:border-blue-500`}
        placeholder={placeholder}
      />
      <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>
    </div>
  );
};

export default NumericInput;
