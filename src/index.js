"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const crds_vault_node_1 = require("@crds_npm/crds-vault-node");
class VaultEnvReplacer {
    constructor() {
        this.fetchedVars = false;
    }
    fetchEnvVariables() {
        const vault = new crds_vault_node_1.VaultToEnv(process.env.CRDS_ENV, this.vaultConfig.vaultUrl || process.env.VAULT_ENDPOINT, process.env.VAULT_ROLE_ID, process.env.VAULT_SECRET_ID, this.vaultConfig.secretFolder || process.env.VAULT_SECRET_FOLDER);
        return vault.process(this.vaultConfig.secrets).then(() => {
            this.fetchedVars = true;
        });
    }
    env() {
        dotenv_1.config(this.options);
        return {
            name: "env",
            transform: async (sourceText, id) => {
                let code = sourceText;
                if (!this.fetchedVars)
                    await this.fetchEnvVariables();
                return new Promise((resolve) => {
                    Object.keys(process.env).forEach((key) => {
                        code = replaceAll(code, `process.env.${key}`, `"${process.env[key]}"`);
                    });
                    resolve(new Promise((resolve) => {
                        return resolve({
                            id,
                            code,
                        });
                    }));
                });
            },
        };
    }
}
exports.VaultEnvReplacer = VaultEnvReplacer;
// https://stackoverflow.com/a/1144788/9238321
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), "g"), replace);
}
