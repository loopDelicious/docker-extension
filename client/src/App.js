import "./App.css";
import { Box, Button } from "@mui/material";
import React, { useState } from "react";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import Ansi from "ansi-to-react";

function App() {
  const ddClient = createDockerDesktopClient();
  const [dockerInfo, setDockerInfo] = useState("");
  console.log("declaration", dockerInfo);

  async function runCommand(collectionID, environmentID, apiKey) {
    try {
      const results = await ddClient.docker.cli.exec("run", [
        `-t`,
        `postman/newman`,
        `run`,
        `https://api.getpostman.com/collections/${collectionID}${
          apiKey && collectionID ? `?apikey=${apiKey}` : ""
        }`,
        `${
          environmentID
            ? `--environment https://api.getpostman.com/environments/${environmentID}`
            : ""
        }${apiKey && environmentID ? `?apikey=${apiKey}` : ""}`,
        `-r`,
        `cli`,
      ]);
      // const results = newman.run(
      //   {
      //     collection: `https://api.getpostman.com/collections/${collectionID}${
      //       apiKey && collectionID ? `?apikey=${apiKey}` : ""
      //     }`,
      //     reporters: `cli,html`,
      //   },
      //   function (err) {
      //     if (err) {
      //       throw err;
      //     }
      //     console.log("collection run complete!");
      //   }
      // );
      console.log(results);
      return results;
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
        console.log(result);
        setDockerInfo(result.stdout);
      } catch (err) {
        console.log("command failed", err);
        setDockerInfo(err);
      }
    } else {
      setDockerInfo("Collection ID is required");
    }
  };

  return (
    <div className="App">
      <h1>Run Postman Collection</h1>
      <p>
        This desktop extension displays output from a Postman collection run.
      </p>
      <Box
        display="flex"
        flexGrow={1}
        justifyContent="center"
        alignItems="start"
        height="10vh"
      >
        <div>
          <div>
            <label htmlFor="collection">
              Postman Collection ID (required):{" "}
            </label>
            <input
              type="text"
              id="collection"
              name="collection"
              required
              placeholder="1559645-07137a33-d3d9-4362-afef-16daca946e03"
            />
          </div>
          <div>
            <label htmlFor="environment">
              Postman Environment ID (optional):{" "}
            </label>
            <input type="text" id="environment" name="environment" />
          </div>
          <div>
            <label htmlFor="apiKey">
              Postman API key (required for non-public collections):{" "}
            </label>
            <input
              type="text"
              id="apiKey"
              name="apiKey"
              required
              placeholder="PMAK-xxx-xxx"
            />
          </div>
        </div>
      </Box>
      <Button id="submit" variant="contained" onClick={submitButton}>
        Run Collection
      </Button>
      {dockerInfo ? (
        <div id="run-results">
          <Ansi>{dockerInfo}</Ansi>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default App;
