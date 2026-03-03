---
title: "Self-Hosting Behind Tailscale with Caddy & Docker"
pubDate: 2026-03-02
description: "A rundown of the various things I self-host in my home lab."
tags: ["tailscale", "homelab", "caddy", "docker", "self-hosting"]
---

In my home lab, I have a Raspberry Pi running in my server closet with Docker. I use Caddy to self-host a number of services — and Tailscale is the glue that makes it all accessible securely without exposing anything directly to the internet.

## The Stack

Everything runs behind [Caddy](https://caddyserver.com/) using the [caddy-docker-proxy](https://github.com/lucaslorentz/caddy-docker-proxy) plugin. The magic here is that each container declares its own routing via Docker labels — no central Caddyfile to maintain. Caddy picks up the labels automatically and handles reverse proxying, TLS, and routing.

For wildcard HTTPS certificates, I use Caddy's DNS challenge with Namecheap as my DNS provider. This means I get valid `*.david-moore.me` certs without any port 80 HTTP challenge, which is important since none of these services are exposed to the public internet — they're only reachable over Tailscale.

## Services I'm Running

**code.david-moore.me** — [code-server](https://github.com/coder/code-server), a browser-based VS Code instance. I can open a browser on any device on my tailnet and get a full development environment on my Pi. Volumes are mapped to my actual home directory so it feels like working locally.

**logs.david-moore.me** — [Dozzle](https://dozzle.dev/), a lightweight real-time Docker log viewer. Great for keeping an eye on what's running without SSHing in.

**actual.david-moore.me** — [Actual Budget](https://actualbudget.org/), a local-first personal finance app. All my financial data stays on my own hardware.

**home.david-moore.me** — A simple nginx container serving static HTML from `~/www`. My personal internal homepage/dashboard.

**uptime.david-moore.me** — Self-hosted monitoring tool. It alerts me on discord if something important goes offline.

**teslamate.david-moore.me** — [TeslaMate](https://teslamate.io/), an open-source logger for Tesla vehicles. I drive a Model Y and it gives me far better trip history, efficiency stats, and charging analytics than the Tesla app.

## How Caddy Routing Works

Each service just needs a couple of labels in its `docker-compose.yml`:
```yaml
labels:
  caddy: myservice.david-moore.me
  caddy.reverse_proxy: "{{upstreams 8080}}"
```

Caddy-docker-proxy watches the Docker socket and automatically creates a reverse proxy route. Adding a new service is as simple as adding those two labels — no restarts, no config file changes.

The wildcard cert is configured on the Caddy container itself:
```yaml
labels:
  caddy: "*.david-moore.me"
  caddy.tls.dns: namecheap
```

## Why Tailscale

All of these subdomains are in public DNS, but they all resolve to tailscale IP addresses (the one for my raspberry pi). This means even if someone knew the URL, they couldn't reach it without being on my Tailscale network. No VPN config, no firewall rules to manage, no open ports on my router. Tailscale handles all of that.

The combination of Tailscale + Caddy wildcard certs means I get:
- Valid HTTPS everywhere (no browser cert warnings)
- Zero public exposure
- Easy access from my phone, laptop, or any device I've added to my tailnet



```
Internet → (blocked) → Firewall
YourDevices → (Tailscale) → Pi → Caddy → code-server
                                        → dozzle
                                        → actual
                                        → Home (nginx)
                                        → TeslaMate
                                        → Grafana
                                        → Uptime Kuma
```

## Keeping Services Organized with Separate Compose Files

Not everything lives in the main `docker-compose.yml`. I organize services into their own directories, each with their own compose file. The folder structure looks like this:
```
~/docker/
├── caddy/
│   ├── docker-compose.yml   # Caddy + core services
│   ├── Dockerfile
│   └── .env
├── uptime-kuma/
│   ├── docker-compose.yml
│   └── uptime-kuma-data/
└── teslamate/
    ├── docker-compose.yml
    └── .env
```

Each stack is independently managed — I can `docker compose up -d` or `docker compose down` a single service without touching anything else. Deployments stay clean and reasoning about each service is straightforward.

## Sharing the Caddy Network

The key to making this work is that Caddy's network is declared as **external** in every compose file that needs it:
```yaml
networks:
  caddy:
    external: true
```

This tells Docker "don't create this network, it already exists — just attach to it." As long as the main Caddy stack is up (which creates the `caddy` network), any other container that joins it will automatically be picked up by caddy-docker-proxy and get its labels honored.

So uptime-kuma just needs these two labels and it's live at `uptime.david-moore.me` with valid HTTPS, no changes to the main Caddy config needed:
```yaml
labels:
  caddy: uptime.david-moore.me
  caddy.reverse_proxy: "{{upstreams 3001}}"
networks:
  - caddy
```

Some services like TeslaMate have internal dependencies (Postgres, Mosquitto, Grafana) that don't need to be on the Caddy network at all — they communicate over Docker's default network. Only the containers that need external routing join `caddy`. This is why TeslaMate declares two networks:
```yaml
networks:
  - caddy    # for external routing via Caddy
  - default  # for internal comms with postgres/mosquitto
```

## Keeping Secrets Out of Compose Files

Passwords and API keys never go in the compose file directly. Each stack that needs secrets gets a `.env` file in the same directory:
```
# teslamate/.env
SECRET_KEY=your-encryption-key-here
DATABASE_PASS=your-db-password-here
```

Docker Compose automatically loads `.env` from the same directory as the compose file, so variables like `${DATABASE_PASS}` just work. The same password can be referenced across multiple services in the same file (teslamate, postgres, grafana, and the backup container all share it) without repeating the value.

The `.env` file goes in `.gitignore` — only a `.env.example` with placeholder values gets committed:
```
# teslamate/.env.example
SECRET_KEY=
DATABASE_PASS=
```

This way the repo documents what variables are needed without leaking anything sensitive.

## What's Next

This setup has been running reliably for months with minimal maintenance. The pattern scales well — adding a new service is usually a five-minute job. I'm planning to write follow-up posts diving deeper into specific services.

If you're running something similar or have questions about any part of the setup, feel free to reach out. I'm on bluesky: @sorakiu.bsky.social