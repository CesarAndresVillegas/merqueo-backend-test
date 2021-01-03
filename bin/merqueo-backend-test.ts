#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { MerqueoBackendTestStack } from "../lib/merqueo-backend-test-stack";

const app = new cdk.App();
const merqueoStack = new MerqueoBackendTestStack(
  app,
  "MerqueoBackendTestStack"
);

cdk.Tags.of(merqueoStack).add("Client", "Merqueo");
cdk.Tags.of(merqueoStack).add("Version", "0.0.1");
cdk.Tags.of(merqueoStack).add("AppName", "MerqueoBackendTest");
