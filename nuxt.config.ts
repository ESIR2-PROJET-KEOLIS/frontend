// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: ['~/assets/css/main.css'],
    ssr: false,
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    runtimeConfig: {
        public: {
            mapboxAccessToken: process.env.MAPACCESSTOKEN,
            urlback:  process.env.URLBACK,
            urlws: process.env.URLWS,
        }
    }
})
