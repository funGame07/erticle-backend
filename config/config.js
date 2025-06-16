
const config = {
    /* session */
    session: {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    
        cookie: {
            maxAge: 1 * 60 * 1000, //1hour
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: process.env.ENVIROMENT === 'production'
        }
    },

    /* cors */
    cors: {
        origin: function(origin, cb){
            if([process.env.FE_ORIGIN, process.env.BE_ORIGIN].indexOf(origin) != -1 || !origin){
                cb(null, true)
            }else{
                cb(new Error(origin + ' not allowed by cors'))
            }
        },
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true
    },

    cookieOptions: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.ENVIROMENT === 'production'
    }
}

module.exports = config