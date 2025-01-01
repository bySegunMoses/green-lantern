const axios = require('axios');
const { exec } = require('child_process');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// GitHub secrets
const GITHUB_USERNAME = process.env.USERNAME;
const GITHUB_TOKEN = process.env.AUTH_TOKEN;
const TWILIO_WHATSAPP_TO = process.env.TWILIO_WHATSAPP_TO;

// WhatsApp or Twitter reminder function
async function sendReminder(message) {
  client.messages.create({
    from: 'whatsapp:+14155238886', // Twilio Sandbox
    to: TWILIO_WHATSAPP_TO, // Use the secret for the recipient's number
    body: message,
  })
  .then((message) => console.log(`Reminder sent! SID: ${message.sid}`))
  .catch((err) => console.error('Error sending reminder:', err));
}

// Check GitHub activity
async function checkContributionStatus() {
  const today = new Date().toISOString().split('T')[0]; // Get today's date
  const url = `https://api.github.com/users/${GITHUB_USERNAME}/events`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    const todayEvents = response.data.filter(event =>
      new Date(event.created_at).toISOString().split('T')[0] === today
    );

    if (todayEvents.length > 0) {
      console.log('✅ All green today! Keep up the great work!');
    } else {
      console.log('⚠️ No activity yet today!');
      await sendReminder('Hey, remember to push, pull, or review some code today to keep that all-green streak alive!');
    }
  } catch (error) {
    console.error('Error checking contribution status:', error.message);
  }
}

// Run the script
checkContributionStatus();
