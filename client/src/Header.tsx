import { Box } from "@mui/material";
import Typography from "@mui/material/Typography/Typography";
import React from "react";
import { LogoutButton } from "./LogoutButton";

export const Header = () => (
    <>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Typography variant="h3">Newman</Typography>
            <LogoutButton />
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ marginY: 2 }}>
            This desktop extension displays output from a Postman collection run.
        </Typography>
    </>
);