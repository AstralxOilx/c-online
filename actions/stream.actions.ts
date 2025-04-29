// src/actions/stream.actions.ts
"use server";

import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_SECRET_KEY!;

export const getStreamToken = async (userId: string) => {
  if (!apiKey || !apiSecret) throw new Error("Missing Stream credentials");

  const client = new StreamClient(apiKey, apiSecret);
  const exp = Math.round(Date.now() / 1000) + 60 * 60;
  const issued = Math.floor(Date.now() / 1000) - 60;

  return client.createToken(userId, exp, issued);
};