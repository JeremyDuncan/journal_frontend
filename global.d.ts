// global.d.ts
declare module 'dompurify' {
    const sanitize: (dirty: string) => string;
    export default {
        sanitize,
    };
}
