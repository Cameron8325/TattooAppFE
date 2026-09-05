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

Build with `VITE_DEMO_MODE=true` and upload the `build` folder or a zip of its
contents to Netlify. The checked-in `public/_redirects` proxies `/api/*` to the
separate free Render demo API, then falls back to `index.html` for application
routes. Configure the API's `FRONTEND_URL` with the exact Netlify public URL.

The demo offers manager and artist entry buttons and uses fictional data.
Its API always uses separate disposable SQLite storage. Free hosting can need
about a minute to wake up; sample changes can reset when the API restarts.
Idempotent reads may retry once after a hosting timeout; writes are never
replayed automatically. Session responses are served with `Cache-Control: no-store`.

Normal studio deployments leave `VITE_DEMO_MODE` unset and configure their own
API routing. Demo entry buttons are omitted from that interface. The checked-in
Netlify proxy is specifically the public sample environment.