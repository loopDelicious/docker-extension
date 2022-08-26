FROM postman/newman:alpine

LABEL maintainer="Danny Dainton <dannydainton@gmail.com>"

RUN npm install -g newman-reporter-htmlextra

WORKDIR /etc/newman

COPY file.hbs /

ENTRYPOINT ["newman"]
