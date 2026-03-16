type Environment = {
  api: {
    server: string;
  };
  mock: boolean;
};

let cachedEnv: Environment | null = null;

export async function loadEnvironment(): Promise<Environment> {
  if (cachedEnv) return cachedEnv;

  const server = process.env.NEXT_PUBLIC_API_SERVER ?? "";

  cachedEnv = {
    api: { server },
    mock: !server,
  };

  return cachedEnv;
}
