import { Spinner } from "flowbite-react";
import { ChangeEventHandler } from "react";

type Props = {
    label?: string;
    helperText?: string;
    multiple: boolean;
    accept?: string;
    files: File[];
    isLoading: boolean;
    onChange?: ChangeEventHandler<HTMLInputElement>
} & typeof defaultProps;

const defaultProps = {
    multiple: false
}

const FileInput = (props: Props) => {
    return (
        <div className="flex justify-center items-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col justify-center items-center w-full h-18 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col justify-center items-center pt-5 pb-6">
                    {props.isLoading ? <Spinner className="mb-3" size="xl" /> : <svg className="mb-3 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>}
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{props.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{props.helperText}</p>
                    {props.files.map(file => (
                        <div key={file.name} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">{file.name}</div>
                    ))}
                </div>
                <input onChange={props.onChange} id="dropzone-file" accept={props.accept} type="file" className="hidden" />
            </label>
        </div>
    )
}

FileInput.defaultProps = defaultProps;
export default FileInput;