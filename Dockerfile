# Base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies in separate step for caching
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Build the app (will copy .env.prod to .env.local internally)
RUN npm run build

# ------------------------
# Production image
# ------------------------
FROM node:18-alpine

WORKDIR /app

# Copy built app from base
COPY --from=base /app .

# Expose the port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]