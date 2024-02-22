# xal-node

**xal-node:** Typescript implementation for Xbox Authentication Library (XAL)

## Installing xal-node

You can install the project with npm. In the project directory, run:

```sh
$ npm install xal-node
```

## Building xal-node

Once the repository has been cloned you can run the command below to build the project:

```sh
$ npm run build
```

## CLI

You can install the `xbox-auth` cli app using the instructions below:

```sh
$ npm install -g xal-node
```

Once installed make sure the npm path is properly set. You should be able to run `xbox-auth` to start the program.

## Available commands

| Command | Description |
|---------|-------------|
| `xbox-auth auth` | Runs the authentication flow and provides an URL to login to. |
| `xbox-auth show` | Shows the current status of the tokens and if they are expired or not. |
| `xbox-auth refresh` | Refreshes the current stored tokens to new up to date tokens without running the full flow again. |
| `xbox-auth tokens` | Fetches all tokens for use with xCloud and xHome |
| `xbox-auth logout` | Removes the current stored tokens | 

## Tokens

The tokens are stored in the current working directory in the file `.xbox.tokens.json`.

## Roadmap

The current library is a very bare bones implementation. The long term plan is to extend the library to support more authentication options and cycle tokens properly.

## Credits

Big thanks to [@tuxuser](https://github.com/tuxuser) and [Team OpenXbox](https://github.com/OpenXbox) for creating the xal-rs library and giving the inspiration to port this over to Typescript