#!/bin/bash
set -e

SERVER="root@contabo2"
REMOTE_DIR="/root/erp"

echo "==> Syncing project files to ${SERVER}:${REMOTE_DIR} ..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude 'dev.db' \
  --exclude 'data' \
  --exclude 'storage' \
  ./ ${SERVER}:${REMOTE_DIR}/

echo "==> Copying Nginx config ..."
scp nginx-erp.conf ${SERVER}:/etc/nginx/conf.d/erp.conf

echo "==> Building and starting Docker container ..."
ssh ${SERVER} "cd ${REMOTE_DIR} && docker compose up -d --build"

echo "==> Fixing volume permissions ..."
ssh ${SERVER} "chown -R 1001:1001 ${REMOTE_DIR}/storage/ ${REMOTE_DIR}/data/"

echo "==> Reloading Nginx ..."
ssh ${SERVER} "nginx -t && nginx -s reload"

echo "==> Done! App deployed at http://erp.tikool.com"
