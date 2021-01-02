#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { MerqueoBackendTestStack } from "../lib/merqueo-backend-test-stack";

const app = new cdk.App();
new MerqueoBackendTestStack(app, "MerqueoBackendTestStack");
