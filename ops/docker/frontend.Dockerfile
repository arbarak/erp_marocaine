FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ .

# Expose port
EXPOSE 3000

# Default command
CMD ["npm", "run", "dev"]
