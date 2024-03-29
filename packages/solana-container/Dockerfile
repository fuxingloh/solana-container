FROM debian:bookworm as builder

# Install os deps
RUN apt update && \
    apt-get install -y build-essential clang cmake curl libudev-dev pkg-config protobuf-compiler && \
    rm -rf /var/lib/apt/lists/*

# Setup rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --default-toolchain 1.59.0 -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Download and build solana-test-validator
WORKDIR /workspace

ARG SOLANA_VERSION
RUN curl https://codeload.github.com/solana-labs/solana/tar.gz/refs/tags/v$SOLANA_VERSION | tar xvz
RUN mv solana-$SOLANA_VERSION /workspace/solana

WORKDIR /workspace/solana
RUN cargo fetch

# Do not optimize the build to reduce the build time, since this is testcontainers not to be used in production.
ENV RUSTFLAGS="-C opt-level=0"
RUN cargo build --bin solana-test-validator --release

FROM debian:bookworm as runner

RUN apt update && \
    apt-get install -y bzip2 libssl-dev && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /workspace/solana/target/release/solana-test-validator /bin/solana-test-validator

EXPOSE 8899 8900
CMD ["solana-test-validator"]
