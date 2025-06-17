const nodemailer = require("nodemailer");

jest.mock("nodemailer");

const mockSendMail = jest.fn().mockResolvedValue({ messageId: "mocked-id" });

nodemailer.createTransport.mockReturnValue({
  sendMail: mockSendMail,
});
