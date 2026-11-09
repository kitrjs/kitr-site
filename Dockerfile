# kitr.dev: read the docs from kitrjs/kitr, prerender every page, serve with nginx.
FROM node:22-alpine AS build
RUN apk add --no-cache git
WORKDIR /site
COPY package.json package-lock.json ./
RUN npm ci
# The kitrjs/kitr commit to read the docs from. The deploy workflow passes the one it resolved, so
# a new commit there is a new layer here and the docs are never stale.
ARG KITR_REF=main
ARG KITR_SHA=
RUN git init -q .content/kitr \
  && git -C .content/kitr fetch -q --depth 1 https://github.com/kitrjs/kitr "${KITR_SHA:-$KITR_REF}" \
  && git -C .content/kitr checkout -q FETCH_HEAD
COPY . .
ARG VITE_GA_MEASUREMENT_ID=
ENV VITE_GA_MEASUREMENT_ID=${VITE_GA_MEASUREMENT_ID}
RUN npm run build
# What is live: this site's commit and the kitr commit its docs come from.
ARG SITE_SHA=dev
RUN printf 'site %s\nkitr %s\n' "$SITE_SHA" "$(git -C .content/kitr rev-parse HEAD)" > dist/site/client/version.txt

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /site/dist/site/client /usr/share/nginx/html
EXPOSE 80
