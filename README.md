# marca.fyi

Visit the website here: [marca.fyi](https://marca.fyi)

This is an automated builder for my personal [website](https://marca.fyi). While it might appear a bit extravagant for crafting a single HTML page, this project is all about showcasing some best practices that can scale to larger endeavors. It includes features such as CI/CD integration, comprehensive documentation, testing capabilities, dynamic page generation from JSON data, assets bundling, and more.

## Requirements

- __Deno__: The project runs on Deno. You need to have it installed on your system.

### Installation

Follow the steps below to set up the environment:

```bash
curl -fsSL https://deno.land/x/install/install.sh | sh
```

## Building the Website

To build the website, use the command:

```bash
deno task build
```

### Flags

- __Release Mode__ (-r): Use this to build the website for release or production. This will bundle JavaScript and CSS assets.

```bash
deno task build -r
```

## Conclusion

Happy building! Remember, the essence of this project isn't just about generating a webpage but showcasing the robust practices that can be applied to more substantial projects.