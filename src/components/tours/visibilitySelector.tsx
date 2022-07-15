import { InformationCircleIcon } from "@heroicons/react/solid";
import { Visibility } from "@prisma/client";
import { Dropdown, Tooltip } from "flowbite-react";
import { useMemo } from "react";

const VisibilitySelector: React.FC<{
    visibility: Visibility,
    onChange: (visibility: Visibility) => void
}> = ({ visibility, onChange }) => {
    const getText = (visibility: Visibility) => {
        if (visibility === "FRIENDS") return "Friends only";
        else if (visibility === "PRIVATE") return "Only you";
        return "Everyone";
    }
    const getInfoText = (visibility: Visibility) => {
        if (visibility === "FRIENDS") return "Only you and your friends can see this tour";
        else if (visibility === "PRIVATE") return "Only you can see this tour";
        return "Everyone who uses Tourgether can see this tour";
    }

    const text = useMemo(() => getText(visibility), [visibility])
    const infoText = useMemo(() => getInfoText(visibility), [visibility])
    const selectedClass = "text-blue-600 font-medium";

    return (
        <div>

            <div className="flex">

                <label
                    htmlFor="visibility"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                    Visibility
                </label>
                <Tooltip content={infoText} placement="right">
                    <InformationCircleIcon className="ml-2 text-gray-700 w-5 h-5"></InformationCircleIcon>
                </Tooltip>
            </div>
            <Dropdown id="visibility" label={text}>
                <Dropdown.Item onClick={() => onChange("PUBLIC")}>
                    <span className={visibility === "PUBLIC" ? selectedClass : ""}>{getText("PUBLIC")}</span>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onChange("FRIENDS")}>
                    <span className={visibility === "FRIENDS" ? selectedClass : ""}>{getText("FRIENDS")}</span>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onChange("PRIVATE")}>
                    <span className={visibility === "PRIVATE" ? selectedClass : ""}>{getText("PRIVATE")}</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    );
}

export default VisibilitySelector;