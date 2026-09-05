# Imaginarium studio frontend

React and Vite workspace for managers and artists: appointments, calendar,
approval requests, clients, staff, service pricing, and completed-work billing.

## Local use

```sh
npm install
npm start
npm test
npm run lint
npm run build
```

The development server forwards `/api/` to the Django API at
`http://127.0.0.1:8000`. Set `API_PROXY_TARGET` to use another local port.
`VITE_API_URL` can override the API address when an explicit separate origin is
needed. The default proxy keeps session and CSRF cookies on the frontend origin.

## Public demo

Deploy this repository to Cloudflare Pages with build command `npm run build`
and output directory `build`. Set `VITE_DEMO_MODE=true` for the public sample
studio and `API_ORIGIN` to the HTTPS origin of the separate Render demo API.
The `functions/api/[[path]].js` route forwards only API requests; static pages
do not invoke the proxy. Set the API's `FRONTEND_URL` to the exact Pages URL.

The demo offers manager and artist entry buttons and uses fictional data.
It never points at the studio's database. Free hosting can need about a minute
to wake up; sample changes can reset when the API restarts.

Normal studio deployments leave `VITE_DEMO_MODE` unset. Demo login buttons
and their shared sample credentials are excluded from that interface.
