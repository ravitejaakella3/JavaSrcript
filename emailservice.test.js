const EmailService = require('./emailservices');
const { MockProvider } = require('./MockProviders');

test('EmailService should send an email successfully', async () => {
    const provider1 = new MockProvider('Provider1');
    const provider2 = new MockProvider('Provider2');
    const emailService = new EmailService([provider1, provider2]);

    const result = await emailService.sendEmail('email1', { to: 'test@example.com', subject: 'Test' });

    expect(result.status).toBe('Success');
});

test('EmailService should retry and fallback between providers', async () => {
    const provider1 = new MockProvider('Provider1');
    const provider2 = new MockProvider('Provider2');
    const emailService = new EmailService([provider1, provider2]);

    jest.spyOn(provider1, 'send').mockImplementation(() => { throw new Error('Provider1 failed'); });
    jest.spyOn(provider2, 'send').mockResolvedValue();

    const result = await emailService.sendEmail('email2', { to: 'test@example.com', subject: 'Test' });

    expect(result.status).toBe('Success');
    expect(result.attempts).toBe(2);
});

test('EmailService should enforce rate limiting', async () => {
    const provider1 = new MockProvider('Provider1');
    const provider2 = new MockProvider('Provider2');
    const emailService = new EmailService([provider1, provider2], 3, 1000, 1);

    await emailService.sendEmail('email3', { to: 'test@example.com', subject: 'Test' });
    const result = await emailService.sendEmail('email4', { to: 'test@example.com', subject: 'Test' });

    expect(result.status).toBe('Rate Limited');
});

test('EmailService should track status correctly', async () => {
    const provider1 = new MockProvider('Provider1');
    const provider2 = new MockProvider('Provider2');
    const emailService = new EmailService([provider1, provider2]);

    await emailService.sendEmail('email5', { to: 'test@example.com', subject: 'Test' });
    const status = emailService.sendAttempts['email5'];

    expect(status).toEqual({ attempts: 1, status: 'Success' });
});
