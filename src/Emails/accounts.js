const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendMail = async function (toemail, name, subject, body) {
  try {
    const info = await transporter.sendMail({
      from: "dubakuntasaiteja@gmail.com",
      to: toemail,
      subject: subject,
      text: `Hi Mr/Mrs.${name}, \n\n${body}\nHave a Nice Day!! \n\nThanks\nTask Manager Api`,
    });
  } catch (e) {
    throw e;
  }
};
