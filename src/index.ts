import { DotenvConfigOptions, config } from "dotenv";
import { VaultToEnv } from "@crds_npm/crds-vault-node";

export type PluginTransformResults = {
  code?: string;
  id?: string;
};

export type VaultConfig = {
  secrets: string[];
  vaultUrl?: string;
  secretFolder?: string;
};

// https://stackoverflow.com/a/1144788/9238321
function replaceAll(str: string, find: string, replace: string) {
  return str.replace(
    new RegExp(find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), "g"),
    replace
  );
}

export function env(vaultConfig: VaultConfig, options?: DotenvConfigOptions) {
  config(options);
  return {
    name: "env",
    transform: async (
      sourceText: string,
      id: string
    ): Promise<PluginTransformResults> => {
      let code = sourceText;

      if (id.indexOf("node_modules") > -1)
        return new Promise(resolve => {
          return resolve({
            id,
            code
          });
        });

      const vault = new VaultToEnv(
        process.env.CRDS_ENV,
        vaultConfig.vaultUrl || process.env.VAULT_ENDPOINT,
        process.env.VAULT_ROLE_ID,
        process.env.VAULT_SECRET_ID,
        vaultConfig.secretFolder || process.env.VAULT_SECRET_FOLDER
      );

      return vault
        .process(vaultConfig.secrets)
        .then(() => {
          Object.keys(process.env).forEach(key => {
            code = replaceAll(
              code,
              `process.env.${key}`,
              `"${process.env[key]}"`
            );
          });
          return new Promise(resolve => {
            return resolve({
              id,
              code
            });
          });
        })
        .catch(() => {
          return new Promise(resolve => {
            return resolve({
              id,
              code
            });
          });
        });
    }
  };
}
