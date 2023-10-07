# marca.fyi

Welcome to the automated builder for my personal website. While this might seem overkill for generating a single HTML page, the intent behind this project is to demonstrate best practices suitable for larger projects. Features include CI/CD, documentation, tests, generating pages from JSON data, assets bundling, and more.

## Requirements

- __Deno__: The project runs on Deno. You need to have it installed on your system.
- __Node.js__: This is required for some of the dependencies.
- __esbuild__: Essential for bundling assets.

## Installation

Follow the steps below to set up the environment:

### Install Deno:

```bash
curl -fsSL https://deno.land/x/install/install.sh | sh
```

### Install Node.js:

#### On Mac:

```bash
brew install node
```

#### On Linux:

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt-get update && sudo apt-get install nodejs -y
```

#### Install esbuild globally:

```bash
npm install esbuild -g
```

### Building the Website

To build the website, use the command:

```bash
deno task build
```

#### Flags

- __Watch Mode__ (-w): This will run the builder with a watcher, observing for changes and rebuilding as necessary.

```bash
deno task build -w
```

- __Release Mode__ (-r): Use this to build the website for release or production. This will bundle JavaScript and CSS assets.

```bash
deno task build -r
```

## Conclusion

Enjoy building! Remember, the essence of this project isn't just about generating a webpage but showcasing the robust practices that can be applied to more substantial projects.