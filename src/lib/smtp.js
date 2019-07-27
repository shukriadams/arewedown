const settings = require('./settings');
    nodemailer = require('nodemailer');

module.exports = async function(to, subject, message){
    let transporter = nodemailer.createTransport({
        host: settings.smtp.server,
        port: settings.smtp.port,
        secure: settings.smtp.secure
    });
    
    let mailOptions = {
        from: settings.fromEmail,
        to, 
        subject,
        text: message
    };

    return await transporter.sendMail(mailOptions);
}