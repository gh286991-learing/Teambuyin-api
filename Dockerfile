FROM node:8-alpine

# set work directory
ENV WORK_DIR /app
WORKDIR ${WORK_DIR}

# cache the node_modules to speed up
COPY package.json ${WORK_DIR}
COPY yarn.lock ${WORK_DIR}

# don't install dev deps to minimize image size
RUN yarn install --production=true

# copy other files to the image
COPY . ${WORK_DIR}/

EXPOSE 80

# start this app
CMD [ "yarn", "start" ]
