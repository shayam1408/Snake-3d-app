# Module B demo record

- Date and time: 2026-11-02 00:39:00 IST
- Source commit: c98d1d6 (working tree with Dockerfile, game-data.json, and weather widget)
- Image tag: abcsteps-snake
- Local origin: http://localhost:8080
- Temporary public URL: None (cloudflared was not installed)
- Outside device and network: Not tested

## Checks
| Check | Status | Evidence |
|---|---|---|
| Image rebuilt from current source | Pass | Dockerfile built using `nginx:alpine` containing static assets, tagged `abcsteps-snake:latest`. |
| Local game loaded and played | Pass | User command `curl -I http://localhost:8080` returned `HTTP/1.1 200 OK` from `nginx/1.31.8`. |
| game-data.json returned 200 | Pass | Endpoint `http://localhost:8080/game-data.json` returned `HTTP/1.1 200 OK` with `{"speed": 130, "snakeColor": "#34d399"}`. |
| Weather showed success or fallback | Pass | User command confirmed Open-Meteo Jodhpur response (`25.4 °C`, `10.3 km/h`). Startup timing fixed so `#weather-text` updates reliably. |
| Outside network opened public URL | Not tested | `cloudflared` not found on system; no public tunnel was launched or tested over cellular data. |
| Tunnel closed and URL stopped | Not tested | Dependent on Quick Tunnel execution; not run. |

## Known limits
- Temporary demo only; stable hosting and uptime were not tested.
- Quick Tunnel requires `cloudflared` binary on the host machine.

## Next repair
- Install `cloudflared` (`winget install --id Cloudflare.cloudflared -e`), launch `cloudflared tunnel --url http://localhost:8080`, and verify outside mobile network access and closure behavior.
