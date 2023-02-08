const withPWA = require('next-pwa')({
    dest: 'public'
})

module.exports = withPWA({
    pwa: {
        disable: process.env.NODE_ENV === 'development',
        dest: 'public'
    },
    images: {
        domains: ['media-exp1.licdn.com', 'www.nonceblox.com']
    }
})