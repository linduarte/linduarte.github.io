API Monitoring & Certbot quick-start

This document shows how to install a simple local health-check (systemd timer) that runs every 5 minutes and optionally reports results to Healthchecks.io.

Overview
- A small script /usr/local/bin/api-healthcheck.sh performs a curl check (with SNI override) and returns 0 on success.
- A systemd service (/etc/systemd/system/api-health.service) runs the script on demand.
- A systemd timer (/etc/systemd/system/api-health.timer) runs the service every 5 minutes.
- Optionally, the script can hit Healthchecks.io "success" and "failure" ping URLs so you get external alerts.

Files to create (run as root or with sudo)

1) Health-check script

Create /usr/local/bin/api-healthcheck.sh with the following contents:

#!/usr/bin/env bash
# health check for api.git-learn.com.br
TARGET="https://api.git-learn.com.br/docs"
RESOLVE="api.git-learn.com.br:443:191.252.204.249"
# Optional: set HC_OK and HC_FAIL to your Healthchecks.io ping URLs
HC_OK="${HC_OK:-}"
HC_FAIL="${HC_FAIL:-}"

if curl -fsS --resolve "$RESOLVE" "$TARGET" -o /dev/null; then
  # notify healthchecks on success if provided
  if [ -n "$HC_OK" ]; then
    curl -fsS --max-time 5 "$HC_OK" >/dev/null || true
  fi
  exit 0
else
  # notify healthchecks on failure if provided
  if [ -n "$HC_FAIL" ]; then
    curl -fsS --max-time 5 "$HC_FAIL" >/dev/null || true
  fi
  echo "API healthcheck failed at $(date)" >&2
  exit 2
fi

Make the script executable:

sudo chmod +x /usr/local/bin/api-healthcheck.sh

2) Systemd service unit

Create /etc/systemd/system/api-health.service:

[Unit]
Description=API healthcheck for api.git-learn.com.br

[Service]
Type=oneshot
ExecStart=/usr/local/bin/api-healthcheck.sh

3) Systemd timer unit

Create /etc/systemd/system/api-health.timer:

[Unit]
Description=Run API healthcheck every 5 minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min
Persistent=true

[Install]
WantedBy=timers.target

4) Enable & start the timer

sudo systemctl daemon-reload
sudo systemctl enable --now api-health.timer
sudo systemctl status api-health.timer

Testing
- Run the script manually to test:

sudo /usr/local/bin/api-healthcheck.sh; echo $?

- Inspect logs of last run:

journalctl -u api-health.service --no-pager -n 200

Optional: Healthchecks.io integration
- Create a check at https://healthchecks.io and copy the "ping URL".
- Set HC_OK to the normal ping URL and HC_FAIL to ping/FAIL URL (or the same URL with /fail) in the script. Example:

HC_OK="https://hc-ping.example/xxxx"
HC_FAIL="https://hc-ping.example/xxxx/fail"

You can export these in the systemd service file by adding an Environment= line under [Service] or hardcode them in the script.

Notes
- The resolve override is intentional because your app runs behind nginx and we want to reach it via the public IP with correct SNI.
- If you prefer external monitoring only, create a Healthchecks check and have your monitor ping your site; local timer is optional but recommended for logs and immediate local checks.

If you want me to add these files directly on the server, say so and provide the Healthchecks ping URLs (if you want alerts). Otherwise copy these snippets to your VPS and run the enable commands above.
