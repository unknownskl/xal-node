# xal-node

**xal-node:** NodeJS bridge for [xal-rs](https://github.com/OpenXbox/xal-rs)

## Installing xal-node

Installing xal-node requires a [supported version of Node and Rust](https://github.com/neon-bindings/neon#platform-support).

You can install the project with npm. In the project directory, run:

```sh
$ npm install
```

This fully installs the project, including installing any dependencies and running the build.

## Building xal-node

If you have already installed the project and only want to run the build, run:

```sh
$ npm run build
```

This command uses the [cargo-cp-artifact](https://github.com/neon-bindings/cargo-cp-artifact) utility to run the Rust build and copy the built library into `./index.node`.

## Tokens

The tokens needs to be stored to be reused later.
@TODO: Explain the tokens and when to save them etc.

## Credits

Big thanks to [@tuxuser](https://github.com/tuxuser) and [Team OpenXbox](https://github.com/OpenXbox) for creating the xal-rs library.