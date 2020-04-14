export declare type PluginTransformResults = {
    code?: string;
    id?: string;
};
export declare type VaultConfig = {
    secrets: string[];
    vaultUrl?: string;
    secretFolder?: string;
};
export declare class VaultEnvReplacer {
    private options;
    private vaultConfig;
    private fetchedVars;
    private fetchEnvVariables;
    env(): {
        name: string;
        transform: (sourceText: string, id: string) => Promise<PluginTransformResults>;
    };
}
