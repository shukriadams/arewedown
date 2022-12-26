/* istanbul ignore next */
const nodemailer = require('nodemailer')
/* istanbul ignore next */
module.exports = class SMTPClient {
    constructor(options){
        this.options = options
    }

    /* istanbul ignore next */
    async test(){
        return new Promise((resolve, reject)=>{
            try {
                const transporter = nodemailer.createTransport({
                    host: this.options.server,
                    port: this.options.port || 587,
                    secure: this.options.secure,
                    auth: {
                        user: this.options.user, 
                        pass: this.options.pass 
                    },
                })

                transporter.verify(function(error) {
                    if (error) 
                          return reject(error)

                    resolve()
                })

            } catch(ex){
                reject(ex)
            }
        })
    }

    /* istanbul ignore next */
    async send(to, from, subject, message){
        const transporter = nodemailer.createTransport({
            host: this.options.server,
            port: this.options.port || 587,
            secure: this.options.secure,
            auth: {
                user: this.options.user, 
                pass: this.options.pass 
            },
        })

        return await transporter.sendMail({
            from: from,
            to: to,
            subject: subject,
            text: message
        })
    }
}