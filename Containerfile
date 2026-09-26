FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && curl -fsSL https://chatgpt.com/codex/install.sh | sh \
  && mkdir -p /opt/ntpilot/bin /data \
  && cp /root/.local/bin/codex /opt/ntpilot/bin/codex \
  && chmod 700 /opt/ntpilot/bin/codex \
  && rm -rf /var/lib/apt/lists/*

# Build from the DistingNT parent directory so both private runtime inputs are
# available: docker build -f ntpilot/Containerfile -t ntpilot .
COPY ntpilot /app/ntpilot
COPY ntpilot-knowledge /app/ntpilot-knowledge

WORKDIR /app/ntpilot
ENV NTPILOT_HOST=0.0.0.0 \
    NTPILOT_PORT=8766 \
    NTPILOT_DATA_DIR=/data \
    NTPILOT_CODEX_RUNTIME=/opt/ntpilot/bin/codex \
    NTPILOT_LOGIN_FLOW=device \
    NTPILOT_SECURE_COOKIES=true

VOLUME ["/data"]
EXPOSE 8766
CMD ["node", "host/ntpilot-host.mjs"]
