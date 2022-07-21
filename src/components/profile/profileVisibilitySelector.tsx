import { InformationCircleIcon } from "@heroicons/react/solid";
import { ProfileVisibility, Visibility } from "@prisma/client";
import { Dropdown, Tooltip } from "flowbite-react";
import { useMemo } from "react";

const ProfileVisibilitySelector: React.FC<{
    visibility: ProfileVisibility,
    onChange: (visibility: ProfileVisibility) => void
}> = ({ visibility, onChange }) => {
    const getText = (visibility: ProfileVisibility) => {
        if (visibility === "PRIVATE") return "Private";
        return "Public";
    }
    const getInfoText = (visibility: ProfileVisibility) => {
        if (visibility === "PRIVATE") return "Nobody can find your profile and send your friend requests";
        return "Everyone who uses Tourgether can see your profile and send you friend requests";
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
                <Dropdown.Item onClick={() => onChange("PRIVATE")}>
                    <span className={visibility === "PRIVATE" ? selectedClass : ""}>{getText("PRIVATE")}</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    );
}

export default ProfileVisibilitySelector;