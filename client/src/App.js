import "./App.css";
import { Stack, FormControl, TextField, Button } from "@mui/material";
import React, { useState } from "react";
import { createDockerDesktopClient } from "@docker/extension-api-client";

function App() {
  const ddClient = createDockerDesktopClient();
  const [dockerInfo, setDockerInfo] = useState(null);
  const [html, setHtml] = useState(null);
  const [collectionError, setCollectionError] = useState(null);
  const [environmentError, setEnvironmentError] = useState(null);
  const [apikeyError, setApikeyError] = useState(null);

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
        } -r htmlextra &> /dev/null && cat newman/*.html"`,
      ]);
      console.log(results);
      setHtml(results.stdout);
    } catch (err) {
      console.log("command failed", err);
      setDockerInfo(err.stdout);
    }
  }

  const validateCollError = () => {
    let collID = document.getElementById("collection-input").value || null;
    setCollectionError(null);
    if (!collID || !(18 < collID.length) || !(collID.length < 50)) {
      setCollectionError("Please enter a collection ID");
    }
  };

  const validateEnvError = () => {
    let envID = document.getElementById("environment-input").value || null;
    setEnvironmentError(null);
    if (envID && (!(18 < envID.length) || !(envID.length < 50))) {
      setEnvironmentError("Please enter an environment ID");
    }
  };

  const validateApikeyError = () => {
    let key =
      document.getElementById("apikey-input").value ||
      "PMAK-6245dae283d9d36ec467cb18-d5a238ce70ed8161d502b30f1db056847b";
    setApikeyError(null);
    if (key && key.toUpperCase().slice(0, 4) !== "PMAK") {
      setApikeyError("Please enter a valid Postman API key");
    }
  };

  // TODO - input API key to return collections in dropdown selector

  const submitButton = async () => {
    let collID =
      document.getElementById("collection-input").value ||
      "1559645-07137a33-d3d9-4362-afef-16daca946e03";
    // TODO remove default value  || "1559645-07137a33-d3d9-4362-afef-16daca946e03"
    let envID = document.getElementById("environment-input").value || null;
    // "13191452-5ea0722b-359b-460f-841b-0665d22cbcba" TODO remove default value
    let key =
      document.getElementById("apikey-input").value ||
      "PMAK-6245dae283d9d36ec467cb18-d5a238ce70ed8161d502b30f1db056847b";
    // this is a sample API key for accessing public collections

    if (!collectionError && !environmentError && !apikeyError) {
      setDockerInfo(`running ...`);
      setHtml(null);
      try {
        const result = await runCommand(collID, envID, key);
        setDockerInfo(null);
      } catch (err) {
        console.log("command failed", err);
        setDockerInfo(err.stdout);
      }
    }
  };

  return (
    <Stack
      display="flex"
      flexGrow={1}
      justifyContent="flex-start"
      alignItems="center"
      height="calc(100vh - 60px)"
    >
      {html ? (
        <>
          <h1 style={{ marginBottom: 2 }}>Postman Results</h1>
          <p style={{ marginBottom: 10 }}>
            This desktop extension displays output from a Postman collection
            run.
          </p>
          <Button
            id="run-new"
            variant="contained"
            onClick={() => setHtml(null)}
            sx={{ mb: 2 }}
          >
            Run New Collection
          </Button>
          <iframe
            id="html-results"
            src={"data:text/html," + encodeURIComponent(html)}
            style={{ border: "none" }}
          ></iframe>
        </>
      ) : (
        <FormControl fullWidth margin="20px">
          <h1 style={{ marginBottom: 2 }}>Run Postman Collection</h1>
          <p style={{ marginBottom: 10 }}>
            This desktop extension displays output from a Postman collection
            run.
          </p>
          <TextField
            id="collection-input"
            label="Postman Collection ID"
            placeholder="e.g. 1559645-07137a33-d3d9-4362-afef-16daca946e03"
            error={collectionError}
            helperText={collectionError ? collectionError : ""}
            onBlur={() => validateCollError()}
            required
            focused
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            id="environment-input"
            label="Postman Environment ID"
            placeholder="e.g. 4946945-c0c950a2-f17e-4c4b-8ea0-8b79066428a1"
            error={environmentError}
            helperText={environmentError ? environmentError : ""}
            onBlur={() => validateEnvError()}
            focused
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            id="apikey-input"
            label="Postman API Key"
            placeholder="e.g. PMAK-xxx-xxxx-xxxx-xxxx"
            error={apikeyError}
            helperText={apikeyError ? apikeyError : ""}
            onBlur={() => validateApikeyError()}
            focused
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            id="submit"
            variant="contained"
            onClick={submitButton}
            sx={{ mb: 2 }}
          >
            Run Collection
          </Button>
          {dockerInfo ? <div id="run-status">{dockerInfo}</div> : null}
        </FormControl>
      )}
    </Stack>
  );
}

export default App;
