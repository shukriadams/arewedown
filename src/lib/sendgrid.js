const settings = require('./settings'),
    Sendgrid = require('sendgrid');

module.exports = async function(to, subject, message){

    let helper = Sendgrid.mail,
        fromEmail = new helper.Email(settings.fromEmail),
        toEmail = new helper.Email(to),
        content = new helper.Content('text/plain', message),
        mail = new helper.Mail(fromEmail, subject, toEmail, content),
        sg = Sendgrid(settings.sendgrid.key),
        request = sg.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
        });
        
    return new Promise((resolve, reject) => {
        try {
            sg.API(request, function (err) {

                if (err) 
                    return reject(err);

                resolve({ result : 'sendgrid send success' });
            });

        } catch (ex) {
            reject (ex);
        }
    })
};