import "./App.css";
import { Stack, FormControl, TextField, Button, MenuItem } from "@mui/material";
import React, { useState } from "react";
import { createDockerDesktopClient } from "@docker/extension-api-client";

function App() {
  const ddClient = createDockerDesktopClient();
  const [dockerInfo, setDockerInfo] = useState(null);
  const [html, setHtml] = useState(null);
  const [postmanInfo, setPostmanInfo] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [apikeyError, setApikeyError] = useState(null);

  async function runCommand(collectionID, environmentID, apiKey) {
    try {
      const results = await ddClient.docker.cli.exec("run", [
        ...["--entrypoint", "/bin/sh"],
        ...["-t", "dannydainton/htmlextra"],
        "-c",
        `"newman run https://api.getpostman.com/collections/${collectionID}?apikey=${apiKey} ${
          environmentID
            ? `--environment https://api.getpostman.com/environments/${environmentID}?apikey=${apiKey}`
            : ""
        } -r htmlextra &> /dev/null && cat newman/*.html"`,
      ]);
      console.log(results);
      setHtml(results.stdout);
    } catch (err) {
      console.log("command failed", err);
      setDockerInfo(err.stdout);
    }
  }

  const validateApikeyError = () => {
    let key =
      document.getElementById("apikey-input").value ||
      "PMAK-6245dae283d9d36ec467cb18-d5a238ce70ed8161d502b30f1db056847b";
    setApikeyError(null);
    if (key && key.toUpperCase().slice(0, 4) !== "PMAK") {
      setApikeyError("Please enter a valid Postman API key");
    } else {
    }
  };

  const getPostmanCollections = async () => {
    try {
      let myHeaders = new Headers();
      myHeaders.append(
        "X-API-Key",
        document.getElementById("apikey-input").value ||
          "PMAK-6245dae283d9d36ec467cb18-d5a238ce70ed8161d502b30f1db056847b"
      );

      let requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };

      return fetch(
        "https://api.getpostman.com/collections",
        requestOptions
      ).then((response) => response.json());
    } catch (err) {
      console.log(err);
    }
  };

  const getPostmanEnvironments = async () => {
    try {
      let myHeaders = new Headers();
      myHeaders.append(
        "X-API-Key",
        document.getElementById("apikey-input").value ||
          "PMAK-6245dae283d9d36ec467cb18-d5a238ce70ed8161d502b30f1db056847b"
      );

      let requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };

      return fetch(
        "https://api.getpostman.com/environments",
        requestOptions
      ).then((response) => response.json());
    } catch (err) {
      console.log(err);
    }
  };

  const getPostmanEntities = async () => {
    try {
      const collections = await getPostmanCollections();
      const environments = await getPostmanEnvironments();
      setPostmanInfo({
        collections: collections.collections,
        environments: environments.environments,
        apikey:
          document.getElementById("apikey-input").value ||
          "PMAK-6245dae283d9d36ec467cb18-d5a238ce70ed8161d502b30f1db056847b",
      });
    } catch (err) {
      console.log("Get Postman entities failed", err);
      setDockerInfo(err.stdout);
    }
  };

  // TODO store API key in local storage
  // TODO handle errors in collection runs

  const submitButton = async () => {
    // let collID =
    //   document.getElementById("collection-select").value ||
    //   "1559645-07137a33-d3d9-4362-afef-16daca946e03";
    // // TODO remove default value  || "1559645-07137a33-d3d9-4362-afef-16daca946e03"
    // let envID = document.getElementById("environment-select").value || null;
    // // "13191452-5ea0722b-359b-460f-841b-0665d22cbcba" TODO remove default value
    // let key =
    //   document.getElementById("apikey-input").value ||
    //   "PMAK-6245dae283d9d36ec467cb18-d5a238ce70ed8161d502b30f1db056847b";
    // // this is a sample API key for accessing public collections

    let collID = selectedCollection;
    let envID = selectedEnvironment;
    let key = postmanInfo.apikey;
    // console.log(collID, envID, key);

    setDockerInfo(`running ...`);
    setHtml(null);
    try {
      const result = await runCommand(collID, envID, key);
      setDockerInfo(null);
    } catch (err) {
      console.log("command failed", err);
      setDockerInfo(err.stdout);
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
      {!html ? (
        <>
          <FormControl fullWidth>
            <h1 style={{ marginBottom: 2 }}>Run Postman Collection</h1>
            <p style={{ marginBottom: 10 }}>
              This desktop extension displays output from a Postman collection
              run.
            </p>
            {!postmanInfo ? (
              <>
                <TextField
                  id="apikey-input"
                  label={[
                    "Enter a ",
                    <a
                      href="https://go.postman.co/settings/me/api-keys"
                      style={{ color: "rgb(25, 118, 210)" }}
                    >
                      Postman API key
                    </a>,
                    " to retrieve your collections.",
                  ]}
                  placeholder="e.g. PMAK-xxx-xxxx-xxxx-xxxx"
                  error={apikeyError}
                  helperText={apikeyError ? apikeyError : ""}
                  onBlur={() => validateApikeyError()}
                  focused
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button
                  id="getPostman"
                  variant="contained"
                  onClick={() => getPostmanEntities()}
                  sx={{ mb: 2 }}
                >
                  Get Postman Collections
                </Button>
              </>
            ) : (
              <>
                <FormControl fullWidth margin="20px" variant="outlined">
                  {postmanInfo.collections.length > 0 ? (
                    <>
                      <TextField
                        value={selectedCollection}
                        onChange={(e) => setSelectedCollection(e.target.value)}
                        select
                        label="Select a collection"
                        sx={{ mb: 2 }}
                      >
                        {postmanInfo.collections.map((coll) => (
                          <MenuItem value={coll.uid}>{coll.name}</MenuItem>
                        ))}
                      </TextField>
                    </>
                  ) : (
                    <>
                      <TextField
                        select
                        label="No collections found"
                        sx={{ mb: 2 }}
                      ></TextField>
                    </>
                  )}

                  {postmanInfo.environments.length > 0 ? (
                    <>
                      <TextField
                        value={selectedEnvironment}
                        onChange={(e) => setSelectedEnvironment(e.target.value)}
                        select
                        label="Select an environment"
                        sx={{ mb: 2 }}
                      >
                        {postmanInfo.environments.map((env) => (
                          <MenuItem value={env.uid}>{env.name}</MenuItem>
                        ))}
                      </TextField>
                    </>
                  ) : (
                    <>
                      <TextField
                        select
                        label="No environments found"
                        sx={{ mb: 2 }}
                      ></TextField>
                    </>
                  )}
                </FormControl>
                {selectedCollection ? (
                  <Button
                    id="submit"
                    variant="contained"
                    onClick={submitButton}
                    sx={{ mb: 2 }}
                  >
                    Run Collection
                  </Button>
                ) : null}
                {dockerInfo ? <div id="run-status">{dockerInfo}</div> : null}
              </>
            )}
          </FormControl>
        </>
      ) : (
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
      )}
    </Stack>
  );
}

export default App;
