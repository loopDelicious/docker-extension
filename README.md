# Postman Docker extension

This Docker Desktop Extension runs Postman collections using Postman's open-source CLI, [Newman](https://hub.docker.com/r/postman/newman/) image and Danny Dainton's [HTMLextra](https://github.com/DannyDainton/newman-reporter-htmlextra) reporter. Run your API tests or execute an API workflow in any server environment. Then review the results of the collection run.

![Newman run results](https://user-images.githubusercontent.com/212269/186909437-107c65db-93b1-4a8c-8f32-bb1271b0dfa0.png)

### How it works

- Enter a Postman API key to retrieve your Postman data
- Select a collection to run, and optionally select an environment to run with the collection
- Run the collection, review the results of the API calls, and filter by failed tests

### Watch the demo
[![Postman Docker extension demo](http://i3.ytimg.com/vi/ClBiZ7qSLcA/hqdefault.jpg)](https://youtu.be/ClBiZ7qSLcA)

### Pre-requisites

- Install [Docker Desktop 4.10.0 or higher](https://docs.docker.com/desktop/release-notes/) that includes the Docker extensions CLI.
- Make sure that Docker Desktop is running in the background. In Docker Desktop, go to the Settings icon > `Extensions` and check `Enable Docker Extensions`.
- [Sign up](https://identity.getpostman.com/signup) for a free Postman account, and [generate an API key](https://go.postman.co/settings/me/account). This is used to access your Postman data, like collections and environments.
- Log in to your Postman account, and create a Postman collection to run. If you don’t have a Postman collection yet, you can fork [this example collection](https://www.postman.com/postman/workspace/test-examples-in-postman/collection/1559645-820d771d-70ab-452f-9edd-0904dbc315b8?ctx=documentation) to your own workspace. Once you do this, the forked collection will appear as your own collection.

This extension is not published yet, so build and deploy it locally from source code.

### Clone the project
Run:

    git clone https://github.com/loopDelicious/docker-extension.git

### Change into the project directory
Run:

    cd docker-extension

### Build and install the extension
Run:

    make && make install

### Build the HTML reporter
Change into the HTML reporter directory:

    cd htmlreporter-with-template

From inside the subdirectory, build the reporter image:

    docker build -t joycelin79/htmlreporter-with-template:latest .

### Developing the frontend
In your terminal, run individually one-by-one:

```
cd ..
cd client
npm install
npm start
```

This starts a development server that listens on port 3000.

You can now tell Docker Desktop to use this as the frontend source. In another terminal, run:

    docker extension dev ui-source joycelin79/newman-extension:latest http://localhost:3000

In order to open the Chrome DevTools for your extension when you click on the extension tab, run:

    docker extension dev debug joycelin79/newman-extension:latest

### Code of Conduct

Everyone is welcome to contribute to this project. Please follow the [Postman Code of Conduct](https://www.postman.com/legal/community-code-of-conduct), and don't be a jerk.
