# ruuvi-cloud-api-token-creator

In-browser tool to create a Ruuvi Cloud API token.

This tool is not made by Ruuvi.

## How it works

The tool uses the Ruuvi Cloud User API at `https://network.ruuvi.com`:

1. `POST /register` with your account email. Ruuvi Cloud emails you a verification code.
2. `GET /verify?token=CODE` with that code. The response contains the access token.

Use the token in the request header: `Authorization: Bearer TOKEN`.

API reference: [ruuvi/ruuvi.cloudapi.yaml](https://github.com/ruuvi/ruuvi.cloudapi.yaml).

## Why you can trust it

- The site is plain HTML, CSS and JavaScript. There is no build step and no dependencies.
- GitHub Pages serves the files from the `main` branch as they are. The code in this repository is the code that runs.
- A Content Security Policy in `index.html` lets the page connect only to `https://network.ruuvi.com`.
- The page does not store the email, the code or the token. It has no analytics.

To check it yourself, open the browser developer tools. Look at the Network tab while you use the page.

## Files

- `index.html` – page structure and Content Security Policy
- `app.js` – API calls and page logic
- `style.css` – styles

## Run locally

Serve the folder with any static web server. For example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Publish on GitHub Pages

In the repository settings, open **Pages**. Set the source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
