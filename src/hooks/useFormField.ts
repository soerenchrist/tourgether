import { useEffect, useState } from "react";

type FormFieldValidator<T> = {
  method: (val: T | undefined) => boolean;
  message?: string;
};

type FormFieldOptions<T> = {
  validator: FormFieldValidator<T>;
};

export const useFormField = <T>(
  defaultValue: T,
  options?: FormFieldOptions<T>
) => {
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const onBlur = () => {
    setTouched(true);
  }

  useEffect(() => {
    if (options?.validator) {
      const valid = options.validator.method(value);
      if (valid) setError(undefined);
      else setError(options.validator.message || "Field is invalid");
    }
  }, [value, options]);

  return {
    value,
    onChange: setValue,
    onBlur,
    error: !touched ? undefined : error,
  };
};
