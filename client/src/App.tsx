import {
  Stack,
  FormControl,
  TextField,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  IconButton,
  Button,
  MenuItem,
  Typography,
  Link,
  Alert,
  debounce,
  Box,
  LinearProgress,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Header } from "./Header";
import { useApiContext } from "./ApiContext";

function App() {
  const ddClient = createDockerDesktopClient();
  const [dockerInfo, setDockerInfo] = useState(null);
  const [html, setHtml] = useState(null);
  const [postmanInfo, setPostmanInfo] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [apikey, setApikey] = useState(null);
  const { apiKey: apiKeyInContext, setApiKey: setApiKeyInContext } =
    useApiContext();
  const [apikeyError, setApikeyError] = useState(null);

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // sample API key: PMAK-6245dae283d9d36ec467cb18-d5a238ce70ed8161d502b30f1db056847b

  async function runCommand(collectionID, environmentID, apiKey) {
    try {
      try {
        await ddClient.docker.cli.exec("run", [
          "--rm",
          ...["--entrypoint", "/bin/sh"],
          ...["-v", "joycelin79_newman-extension-desktop-extension:/tmp"],
          "joycelin79/htmlreporter-with-template:0.0.2",
          "-c",
          `"newman run https://api.getpostman.com/collections/${collectionID}?apikey=${apiKey} ${
            environmentID
              ? `--environment https://api.getpostman.com/environments/${environmentID}?apikey=${apiKey}`
              : ""
          } -r htmlextra --reporter-htmlextra-template /file.hbs --reporter-htmlextra-export /tmp/report.html"`,
        ]);
      } catch {
        console.log("There are some errors in tests");
      }

      let results = "";

      await ddClient.docker.cli.exec(
        "run",
        [
          "--rm",
          ...["--entrypoint", "cat"],
          ...["-v", "joycelin79_newman-extension-desktop-extension:/tmp"],
          "joycelin79/htmlreporter-with-template:0.0.2",
          "/tmp/report.html",
        ],
        {
          stream: {
            onOutput(data) {
              if (data.stdout) {
                results += data.stdout;
              } else {
                console.log("Error while getting the output");
                console.log(data.stderr);
              }
            },
            onError(error) {
              console.log("Error while getting the output");
              console.log(error);
            },
            onClose(exitCode) {
              if (exitCode != 0) {
                console.log("Error getting the output, exit code " + exitCode);
              } else {
                setHtml(results);
                setDockerInfo(null);
              }
            },
            splitOutputLines: true,
          },
        }
      );
    } catch (err) {
      console.log("ddclient command failed", err);
      setDockerInfo(`ddclient command failed: ` + err.cmd);
    }
  }

  const validateApikeyError = (key: string) => {
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
      myHeaders.append("X-API-Key", apiKeyInContext);

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
      myHeaders.append("X-API-Key", apiKeyInContext);

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

  useEffect(() => {
    if (apiKeyInContext) {
      getPostmanEntities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKeyInContext]);

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
    // console.log(collID, envID, key);

    setDockerInfo(`running ...`);
    setHtml(null);
    try {
      const result = await runCommand(collID, envID, apiKeyInContext);
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
      height="100%"
    >
      <Header />
      {!html ? (
        <>
          {apiKeyInContext && !postmanInfo ? (
            <Box mb={2} sx={{ width: "100%" }}>
              <LinearProgress />
            </Box>
          ) : null}
          {!apiKeyInContext || !postmanInfo ? (
            <>
              <FormControl fullWidth focused sx={{ marginY: 2 }}>
                <InputLabel htmlFor="apikey-input">Postman API key</InputLabel>
                <OutlinedInput
                  id="apikey-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="e.g. PMAK-xxx-xxxx-xxxx-xxxx"
                  error={!!apikeyError}
                  onChange={(e) => {
                    validateApikeyError(e.target.value);
                  }}
                  label="Postman API key"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              <FormHelperText>{apikeyError ? apikeyError : ""}</FormHelperText>
            </FormControl>
              <Alert severity="info" sx={{ marginY: 2 }}>
                Find your Postman API key in{" "}
                <Link
                  href="#"
                  onClick={() =>
                    ddClient.host.openExternal(
                      "https://go.postman.co/settings/me/api-keys"
                    )
                  }
                >
                  your Postman settings
                </Link>
                .
              </Alert>
              <Button
                id="getPostman"
                variant="contained"
                onClick={() => setApiKeyInContext(apikey)}
                sx={{ mb: 2 }}
                disabled={!apikey}
              >
                Get Postman Collections
              </Button>
            </>
          ) : (
            <>
              {postmanInfo?.collections?.length > 0 ? (
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

              {postmanInfo?.environments?.length > 0 ? (
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
        </>
      ) : (
        <Stack direction="column" height="100%">
          <Button
            id="run-new"
            variant="contained"
            onClick={() => setHtml(null)}
            sx={{ mb: 2, flex: 0 }}
          >
            Run New Collection
          </Button>
          <Box flex={1}>
            <iframe
              width="100%"
              height="100%"
              id="html-results"
              srcDoc={html}
              style={{ border: "none" }}
            />
          </Box>
        </Stack>
      )}
    </Stack>
  );
}

export default App;
