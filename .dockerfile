FROM oven/bun:1.3.13 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --ignore-scripts

COPY src ./src

# Commands, events, and subcommands are loaded with dynamic import(), so each
# one stays a separate file under dist/ and keeps the source folder layout.
RUN entries="$(find src -name '*.ts' ! -name '*.d.ts' ! -path 'src/templates/*')" \
    && bun build $entries --outdir dist --root src --target bun --packages external

FROM oven/bun:1.3.13

USER root

ARG DOCKER_VERSION=29.9.3
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && arch="$(dpkg --print-architecture)" \
    && case "$arch" in \
        amd64) docker_arch=x86_64 ;; \
        arm64) docker_arch=aarch64 ;; \
        *) echo "unsupported architecture: $arch" >&2; exit 1 ;; \
    esac \
    && curl -fsSL "https://download.docker.com/linux/static/stable/${docker_arch}/docker-${DOCKER_VERSION}.tgz" -o /tmp/docker.tgz \
    && tar -xzf /tmp/docker.tgz -C /tmp \
    && mv /tmp/docker/docker /usr/local/bin/docker \
    && rm -rf /tmp/docker /tmp/docker.tgz \
    && apt-get purge -y curl \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER bun
WORKDIR /app/dist
CMD ["bun", "index.js"]
