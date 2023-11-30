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

Once installed make sure the npm path is properly set. You should be able to run `xbox-auth` to generate a .xbox.tokens.json file with tokens.

## Tokens

The tokens are stored in the current working directory in the file `.xbox.tokens.json`.

## Roadmap

The current library is a very bare bones implementation. The long term plan is to extend the library to support more authentication options and cycle tokens properly.

## Credits

Big thanks to [@tuxuser](https://github.com/tuxuser) and [Team OpenXbox](https://github.com/OpenXbox) for creating the xal-rs library and giving the inspiration to port this over to Typescript