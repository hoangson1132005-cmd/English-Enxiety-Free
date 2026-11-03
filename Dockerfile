# syntax=docker/dockerfile:1
# Đóng gói English Anxiety Free để chạy trên bất kỳ máy chủ nào có Docker (x86 hoặc ARM như Oracle Ampere).

FROM node:22-bookworm-slim AS base
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- Cài thư viện (có cache) ---
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# --- Build ứng dụng ---
FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

# --- Công cụ dòng lệnh (migrate database, tạo admin, đặt lại mật khẩu): có đủ thư viện dev ---
FROM builder AS tools
ENV NODE_ENV=production
CMD ["bash"]

# --- Ảnh chạy thật: nhỏ gọn, chạy bằng người dùng không có quyền root ---
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 app && useradd --system --uid 1001 --gid app app
COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
USER app
EXPOSE 3000
CMD ["node", "server.js"]
