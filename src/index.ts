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

export class VaultEnvReplacer {
  private options: DotenvConfigOptions;
  private vaultConfig: VaultConfig;
  private vaultPromise: Promise<any>;

  constructor(vaultConfig: VaultConfig, options?: DotenvConfigOptions) {
    config(this.options);
    this.options = options;
    this.vaultConfig = vaultConfig;

    const vault = new VaultToEnv(
      process.env.CRDS_ENV,
      this.vaultConfig.vaultUrl || process.env.VAULT_ENDPOINT,
      process.env.VAULT_ROLE_ID,
      process.env.VAULT_SECRET_ID,
      this.vaultConfig.secretFolder || process.env.VAULT_SECRET_FOLDER
    );
    console.log('fetching vault vars')
    this.vaultPromise = this.fetchVaultVars(vault);
  }

  private fetchVaultVars(vault: VaultToEnv): Promise<any> {
    return vault.process(this.vaultConfig.secrets)
    .then(() => console.log('vault vars received'))
    .catch(err => {
      console.log(err);
      //retry
      return this.fetchVaultVars(vault);
    });
  }

  public env() {
    return {
      name: "env",
      transform: async (
        sourceText: string,
        id: string
      ): Promise<PluginTransformResults> => {
        let code = sourceText;

        if (id.indexOf("node_modules") > -1 && id.indexOf("@crds_npm") < 0)
        return new Promise(resolve => {
          return resolve({
            id,
            code
          });
        });


        return this.vaultPromise
          .then(() => {
            Object.keys(process.env).forEach((key) => {
              code = this.replaceAll(
                code,
                `process.env.${key}`,
                `"${process.env[key]}"`
              );
            });
            return new Promise((resolve) => {
              return resolve({
                id,
                code,
              });
            });
          })
          .catch(() => {
            return new Promise((resolve) => {
              return resolve({
                id,
                code,
              });
            });
          });
      },
    };
  }

  private replaceAll(str: string, find: string, replace: string) {
    return str.replace(
      new RegExp(find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), "g"),
      replace
    );
  }
}
