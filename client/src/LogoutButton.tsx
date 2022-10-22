import { LogoutOutlined } from "@mui/icons-material"
import { Button } from "@mui/material"
import { useApiContext } from "./ApiContext"

export const LogoutButton = () => {
    const {apiKey, setApiKey} = useApiContext();

    if (!apiKey) return null;

    return (
        <Button endIcon={<LogoutOutlined/>} variant="outlined" onClick={() => setApiKey('')}>Logout</Button>
    )
}
