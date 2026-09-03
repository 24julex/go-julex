# ---------- Stage 1: build the Vite frontend ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Inside Docker the frontend calls the backend via the nginx /api proxy
ENV VITE_API_BASE_URL=/api
RUN npm run build

# ---------- Stage 2: serve with nginx ----------
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
