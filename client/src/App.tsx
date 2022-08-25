import {Stack, FormControl, TextField, Button, MenuItem, Typography} from "@mui/material";
import React, { useState } from "react";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Header } from "./Header";

function App() {
  const ddClient = createDockerDesktopClient();
  const [dockerInfo, setDockerInfo] = useState(null);
  const [html, setHtml] = useState(null);
  const [postmanInfo, setPostmanInfo] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [apikey, setApikey] = useState(null);
  const [apikeyError, setApikeyError] = useState(null);

  async function runCommand(collectionID, environmentID, apiKey) {
    try {
      const results = await ddClient.docker.cli.exec("run", [
        "--rm",
        ...["--entrypoint", "/bin/sh"],
        // ...["-v", "joycelin79_newman-extension-desktop-extension:/tmp"],
        "joycelin79/htmlextra",
        "-c",
        `"newman run https://api.getpostman.com/collections/${collectionID}?apikey=${apiKey} --reporter-htmlextra-template=/file.hbs ${
          environmentID
            ? `--environment https://api.getpostman.com/environments/${environmentID}?apikey=${apiKey}`
            : ""
        } -r htmlextra"`,
      ]);
      console.log(results);
      setHtml(results.stdout);
    } catch (err) {
      console.log("ddclient command failed", err);
      setDockerInfo(`ddclient command failed: ` + err.cmd);
    }
  }

  const validateApikeyError = () => {
    let key =
      document.getElementById("apikey-input").value ||
      "PMAK-6245dae283d9d36ec467cb18-d5a238ce70ed8161d502b30f1db056847b";
    // this is a sample API key for accessing public collections
    setApikeyError(null);
    if (key && key.toUpperCase().slice(0, 4) !== "PMAK") {
      setApikeyError("Please enter a valid Postman API key");
    } else {
      setApikey(key);
    }
  };

  const getPostmanCollections = async () => {
    try {
      let myHeaders = new Headers();
      myHeaders.append("X-API-Key", apikey);

      let requestOptions: RequestInit = {
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
      myHeaders.append("X-API-Key", apikey);

      let requestOptions: RequestInit = {
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
        apikey: apikey,
      });
    } catch (err) {
      console.log("Get Postman entities failed", err);
      // setDockerInfo(err.stdout);
    }
  };

  // TODO store API key in local storage
  // TODO handle errors in collection runs

  const submitButton = async () => {
    let collID = selectedCollection;
    let envID = selectedEnvironment;
    let key = apikey;
    // console.log(collID, envID, key);

    setDockerInfo(`running ...`);
    setHtml(null);
    try {
      const result = await runCommand(collID, envID, key);
      // setDockerInfo(null);
    } catch (err) {
      console.log("run command failed", err);
      setDockerInfo(err);
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
      <Header/>
      {!html ? (
        <>
          <FormControl fullWidth sx={{ marginTop: 2 }}>
            {!postmanInfo ? (
              <>
                <TextField
                  id="apikey-input"
                  label={[
                    "Postman API key",
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
                  disabled={!apikey}
                >
                  Get Postman Collections
                </Button>
              </>
            ) : (
              <>
                <FormControl fullWidth sx={{ margin: "20px" }} variant="outlined">
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
          <Button
            id="run-new"
            variant="contained"
            onClick={() => setHtml(null)}
            sx={{ mb: 2 }}
          >
            Run New Collection
          </Button>
          <iframe
            width="100%"
            height="100%"
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
