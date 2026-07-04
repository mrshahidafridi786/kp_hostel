import HostelInfo from '../models/HostelInfo';

export const sendWhatsApp = async (to: string, message: string): Promise<boolean> => {
  try {
    const hostelInfo = await HostelInfo.findOne();

    if (
      hostelInfo?.contact?.twilioSid &&
      hostelInfo?.contact?.twilioAuthToken &&
      hostelInfo?.contact?.twilioWhatsAppNumber
    ) {
      // Lazy-load Twilio SDK if credentials are input in Admin panel
      // For MVP, we can import twilio dynamically or perform a fetch request
      // We will perform a fetch or log since twilio is not in dependencies,
      // but let's implement the API request to Twilio endpoint
      const sid = hostelInfo.contact.twilioSid;
      const token = hostelInfo.contact.twilioAuthToken;
      const from = hostelInfo.contact.twilioWhatsAppNumber;
      
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      
      // Clean phone number (add country code if missing)
      let formattedTo = to.trim();
      if (!formattedTo.startsWith('whatsapp:')) {
        if (!formattedTo.startsWith('+')) {
          // Default Pakistan country code if starts with 0
          if (formattedTo.startsWith('0')) {
            formattedTo = '+92' + formattedTo.slice(1);
          } else {
            formattedTo = '+' + formattedTo;
          }
        }
        formattedTo = 'whatsapp:' + formattedTo;
      }

      let formattedFrom = from.trim();
      if (!formattedFrom.startsWith('whatsapp:')) {
        formattedFrom = 'whatsapp:' + (formattedFrom.startsWith('+') ? formattedFrom : '+' + formattedFrom);
      }

      console.log(`[WHATSAPP-REAL] Sending via Twilio to ${formattedTo} from ${formattedFrom}`);
      
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: formattedFrom,
          To: formattedTo,
          Body: message
        })
      });

      if (res.ok) {
        console.log(`[WHATSAPP-SERVICE] WhatsApp sent successfully via Twilio to: ${to}`);
        return true;
      } else {
        const errText = await res.text();
        console.error(`[WHATSAPP-SERVICE] Twilio API Error: ${errText}`);
        return false;
      }
    } else {
      // Mock driver
      console.log(`[WHATSAPP-MOCK] sending WhatsApp to: ${to}`);
      console.log(`[WHATSAPP-MOCK] Message: ${message}`);
      return true;
    }
  } catch (error) {
    console.error(`[WHATSAPP-SERVICE] Error sending WhatsApp message: ${(error as Error).message}`);
    return false;
  }
};
