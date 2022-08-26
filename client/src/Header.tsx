import Typography from "@mui/material/Typography/Typography";
import React from "react";

export const Header = () => (
    <>
        <Typography variant="h3">Postman Results</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ marginY: 2 }}>
            This desktop extension displays output from a Postman collection run.
        </Typography>
    </>
);