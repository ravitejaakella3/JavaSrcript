class MockProvider {
    constructor(name) {
        this.name = name;
    }

    async send(emailData) {
        console.log(`Sending email via ${this.name}...`);
        if (Math.random() > 0.7) {
            throw new Error(`${this.name} failed to send email.`);
        }
        console.log(`Email sent via ${this.name}`);
    }
}

module.exports = { MockProvider };
