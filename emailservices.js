class EmailService {
    constructor(providers, maxRetries = 5, backoffFactor = 1000, rateLimit = 3) {
        this.providers = providers;
        this.maxRetries = maxRetries;
        this.backoffFactor = backoffFactor;
        this.rateLimit = rateLimit;
        this.sentEmails = new Set(); 
        this.sendAttempts = {}; 
        this.rateLimitCounter = 0;
        this.rateLimitWindow = 60 * 1000;
        this.lastResetTime = Date.now();
    }

    async sendEmail(emailId, emailData) {
        if (this.sentEmails.has(emailId)) {
            console.log(`Email with ID ${emailId} has already been sent.`);
            return { status: 'Duplicate', attempts: this.sendAttempts[emailId] };
        }

        if (this.rateLimitCounter >= this.rateLimit) {
            const currentTime = Date.now();
            if (currentTime - this.lastResetTime > this.rateLimitWindow) {
                this.rateLimitCounter = 0;
                this.lastResetTime = currentTime;
            } else {
                console.log('Rate limit exceeded. Please try again later.');
                return { status: 'Rate Limited', attempts: this.sendAttempts[emailId] };
            }
        }

        this.rateLimitCounter++;

        let attempt = 0;
        let providerIndex = 0;
        let sent = false;

        while (attempt < this.maxRetries && !sent) {
            try {
                await this.providers[providerIndex].send(emailData);
                this.sentEmails.add(emailId);
                sent = true;
                console.log(`Email sent successfully using provider ${providerIndex + 1}`);
                this.trackStatus(emailId, attempt + 1, 'Success');
                return { status: 'Success', attempts: attempt + 1 };
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed with provider ${providerIndex + 1}:`, error);
                attempt++;
                providerIndex = (providerIndex + 1) % this.providers.length;
                if (attempt < this.maxRetries) {
                    await this.exponentialBackoff(attempt);
                }
            }
        }

        this.trackStatus(emailId, attempt, 'Failed');
        return { status: 'Failed', attempts: attempt };
    }

    trackStatus(emailId, attempts, status) {
        this.sendAttempts[emailId] = { attempts, status };
    }

    async exponentialBackoff(attempt) {
        const delay = Math.pow(2, attempt) * this.backoffFactor;
        console.log(`Backing off for ${delay}ms`);
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}

module.exports = EmailService;
