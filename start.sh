#!/usr/bin/env bash

cd frontend
npm ci
npx tsc -b
cd ..
deno run --allow-net=0.0.0.0 --allow-read=frontend,backend backend/app.ts
