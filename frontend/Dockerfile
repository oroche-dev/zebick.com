# Multi-stage build: CRA/craco produces a static build/ folder that's served
# by nginx — there is no Node server at runtime.

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

# CRA bakes REACT_APP_* vars into the static bundle at BUILD time, not at
# container-start time — pass the real backend URL as a build arg.
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ARG REACT_APP_GA_ID
ENV REACT_APP_GA_ID=$REACT_APP_GA_ID
RUN yarn build

FROM nginx:1.27-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
