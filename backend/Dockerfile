FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the project
RUN npm run build
RUN npx prisma generate

EXPOSE 3333

# Start the application
CMD ["npm", "start"]
