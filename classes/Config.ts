export class Config{
    static get urlWS(): string {
        if(!this.initialized) this.init();
        return this._urlWS;
    }
    static get urlBack(): string {
        if(!this.initialized) this.init();
        return this._urlBack;
    }

    public static readonly busColor = "#1f89a9";
    public static readonly busStopColor = "#797979";
    private static _urlBack = "http://localhost:3500";
    private static _urlWS = "ws://localhost:4000";
    private static initialized = false;

    private static init(){
        this.initialized = true;
        Config._urlWS = useRuntimeConfig().public.urlws || "ws://localhost:4000";
        Config._urlBack = useRuntimeConfig().public.urlback || "http://localhost:3500";
    }
}