FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o opentui_mcp_server ./cmd/

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/opentui_mcp_server .

ENV TRANSPORT=http
ENV PORT=8080
ENV INDEX_PATH=/data/index

EXPOSE 8080

CMD ["./opentui_mcp_server"]