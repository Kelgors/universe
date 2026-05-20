import { createPrivateKey, createPublicKey, generateKeyPair } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import z from "zod";

export const configFileSchema = z.object({
  privateKey: z.string().transform((txt) => {
    return createPrivateKey({ key: Buffer.from(txt, "utf-8"), format: "pem", type: "pkcs8" });
  }),
  trustedPeers: z
    .object({
      nodeId: z.string(),
      comment: z.string().optional(),
      host: z.string().transform((host) => {
        const [hostname, port] = host.split(":");
        return { ip: z.hostname(hostname).parse(hostname), port: z.number().gt(0).lte(65535).parse(Number(port)) };
      }),
      publicKey: z.string().transform((txt) => {
        return createPublicKey({ key: Buffer.from(txt, "utf-8"), format: "pem", type: "spki" });
      }),
    })
    .array()
    .optional(),
});

async function createDefaultConfig(path: string) {
  const { privateKey } = await promisify(generateKeyPair)("ed25519");
  const config = JSON.stringify(
    {
      privateKey: privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
      trustedPeers: [],
    },
    null,
    2,
  );
  await writeFile(path, config);
  return config;
}

export async function loadConfig(path: string) {
  const fileContent = await readFile(path, "utf-8").catch((err) => {
    if (err.code === "ENOENT") {
      return createDefaultConfig(path);
    }
    throw err;
  });
  const parsedConfig = configFileSchema.parse(JSON.parse(fileContent));
  const publicKey = createPublicKey(parsedConfig.privateKey);

  return {
    privateKey: parsedConfig.privateKey,
    publicKey,
    trustedPeers: parsedConfig.trustedPeers ?? [],
  };
}

export type Configuration = Awaited<ReturnType<typeof loadConfig>>;
