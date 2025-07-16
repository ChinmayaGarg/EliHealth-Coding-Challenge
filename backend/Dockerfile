FROM node:20

RUN apt-get update && \
    apt-get install -y graphicsmagick && \
    apt-get clean
    
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
