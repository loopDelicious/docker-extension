import "./App.css";
import {
  Stack,
  FormControl,
  TextField,
  FormHelperText,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import { createDockerDesktopClient } from "@docker/extension-api-client";

function App() {
  const ddClient = createDockerDesktopClient();
  const [dockerInfo, setDockerInfo] = useState("");
  const [html, setHtml] = useState(null);

  async function runCommand(collectionID, environmentID, apiKey) {
    try {
      const results = await ddClient.docker.cli.exec("run", [
        ...["--entrypoint", "/bin/sh"],
        ...["-t", "dannydainton/htmlextra"],
        "-c",
        `"newman run https://api.getpostman.com/collections/${collectionID}${
          apiKey && collectionID ? `?apikey=${apiKey}` : ""
        } ${
          environmentID
            ? `--environment https://api.getpostman.com/environments/${environmentID}`
            : ""
        }${
          apiKey && environmentID ? `?apikey=${apiKey}` : ""
        } -r htmlextra && cat newman/*.html"`,
      ]);
      console.log(results);
      // return results;
      setHtml(results.stdout);
    } catch (err) {
      console.log("command failed", err);
    }
  }

  const submitButton = async () => {
    setDockerInfo(`running ...`);
    let collID =
      document.getElementById("collection").value ||
      "1559645-07137a33-d3d9-4362-afef-16daca946e03";
    let envID = document.getElementById("environment").value || null; // "13191452-5ea0722b-359b-460f-841b-0665d22cbcba" substitute in a dummy user's API key
    let key =
      document.getElementById("apiKey").value ||
      "PMAK-6245dae283d9d36ec467cb18-d5a238ce70ed8161d502b30f1db056847b"; // this is a sample API key for accessing public collections
    if (collID) {
      try {
        const result = await runCommand(collID, envID, key);
        setDockerInfo("");
      } catch (err) {
        console.log("command failed", err);
        setDockerInfo(err);
      }
    } else {
      setDockerInfo("Collection ID is required");
    }
  };

  return (
    <Stack
      display="flex"
      flexGrow={1}
      justifyContent="flex-start"
      alignItems="center"
      padding="20px"
      height="calc(100vh - 60px)"
    >
      <h1>Run Postman Collection</h1>
      <p>
        This desktop extension displays output from a Postman collection run.
      </p>
      <FormControl fullWidth margin="20px">
        <div>
          <TextField
            id="collection"
            name="collection"
            label="Postman Collection ID"
            required
            focused
            fullWidth
          />
          <FormHelperText id="collection-helper-text">
            e.g. 1559645-07137a33-d3d9-4362-afef-16daca946e03
          </FormHelperText>
        </div>
        <div>
          <TextField
            id="environment"
            name="environment"
            label="Postman Environment ID"
            focused
            fullWidth
          />
          <FormHelperText id="environment-helper-text">
            e.g. 4946945-c0c950a2-f17e-4c4b-8ea0-8b79066428a1
          </FormHelperText>
        </div>
        <div>
          <TextField
            id="apiKey"
            name="apiKey"
            label="Postman API Key"
            focused
            fullWidth
          />
          <FormHelperText id="apikey-helper-text">
            e.g. PMAK-xxx-xxx. Required for non-public collections.
          </FormHelperText>
        </div>
      </FormControl>
      <Button id="submit" variant="contained" onClick={submitButton}>
        Run Collection
      </Button>
      {dockerInfo ? <div id="run-results">{dockerInfo}</div> : null}
      {html ? (
        <iframe
          id="html-results"
          src={"data:text/html," + encodeURIComponent(html)}
        ></iframe>
      ) : null}
    </Stack>
  );
}

export default App;
