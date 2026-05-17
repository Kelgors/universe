import { readFile, writeFile } from "node:fs/promises";
import { type Bytes, getPublicKeyAsync, keygenAsync } from "@noble/ed25519";
import z from "zod";

function transformKey(hex: string): Bytes {
  return Buffer.from(hex, "hex");
}

export const configFileSchema = z.object({
  privateKey: z.string().transform(transformKey),
  trustedPeers: z
    .object({
      id: z.string(),
      comment: z.string().optional(),
      host: z.string().transform((host) => {
        const [hostname, port] = host.split(":");
        return { ip: z.hostname(hostname).parse(hostname), port: z.number().gt(0).lte(65535).parse(Number(port)) };
      }),
      publicKey: z.string().transform(transformKey),
    })
    .array()
    .optional(),
});

async function createDefaultConfig(path: string) {
  const { secretKey } = await keygenAsync();
  const config = JSON.stringify(
    {
      privateKey: Buffer.from(secretKey).toString("hex"),
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
  const publicKey: Bytes = await getPublicKeyAsync(parsedConfig.privateKey);

  return {
    privateKey: parsedConfig.privateKey,
    publicKey,
    trustedPeers: parsedConfig.trustedPeers ?? [],
  };
}

export type Configuration = Awaited<ReturnType<typeof loadConfig>>;
