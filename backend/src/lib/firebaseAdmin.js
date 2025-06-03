import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
 "type": "service_account",
  "project_id": "chatapp-678e2",
  "private_key_id": "0ece3786fad51e44764f26cbe6df5a17462eb683",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCqaFzyoZqUWQ31\nYS7Pl+u7bnQtK3BBHIwfg6wZsYDiLoAg5H/xufQA5U/q7cy+0Cp/XpwSna8ckTkY\ntBzQic8ymYHAFwifWSM0P3D2+IWYO7heEr5djlmUdXlaWSjZASXyBgtmB3MohkHw\nw5RmIbFYS6XoKPyssNkvAeKNTs8oTvo+mRnpjOf/Q9hptgklvK+H7YJcCgP3/njj\n+H2kFZe0/waBLXpaDNY/uX6x5B8zIaR+KL94717MAZn+KYKBukirFVcPXJy8f0O1\nwvQBc4Qlsf2kpfp2Mhp5btLjEya45qDptFvE0cv+NerVDyL4aVpVf5oL7ym2VZMm\nM6V9wjdDAgMBAAECggEAGnHwvryiixQY7PQkehXnAOLex6W+mXQvMLLT8fbQfAlg\nW/pp+p7zhXIQyXIW/KO8fKC3ktICu2m0FSfacuh4Da+x6ZgJgAUqx/ByfPlLbjkS\nXxMElOtC7p2edA1zH94kP999RFuynN7c+9q2PHVNGtk+iX1W3Qvi4H8n4+sPjf8W\nnr/6Uc+tjFxaFaEdLicOzIcrBSsjSyZ9j8NXKQDFmL8/oKPyJAgfOaQ2jRMSsyUC\nkhmlmTTYkCDV/7uvrG9DVIEc0lJ76TEe8yT1BarFGN/LGjF2GX/dFPw2/ttgmECt\ntQ9zXFeS7ct+MFA1z3Pm5Z3k327PDm6QJ2zYWvPWKQKBgQDini6ftzVEOJbyv5qD\n/VQQRBfih+fpFpmDEMEr9hK0o62tL/IYwnEbG5ZCdVnUlgFyT5irMA+r5v/3DFPo\ni5R79zpFKI0dYONvXVzKjLGfdqGdMQP1ZuZwpsFn8lfAw6jMi24eAEvmPKnCH5YK\n2pNVwGsRs5P1lAsqriurBG6KSwKBgQDAgHi/WKPMMxBCqJrWyvGAmtApOk9tEY03\nNmd8QpiwT2fRKJEOQIxiB57h1zyu0DrYtZlP2uqahGp1DnYn7AfTuygfS0wjOmhW\nxh7/8j0/uR9an/6xALKI1yNEoOfqA3THTG/WjBqwJT0Smeaic4zJgYPgRW+RLzm3\nuDRI3Gtr6QKBgQDFCvVPOmW+Y9YcTC12BpdJbWu3NKSZL2VbaP4N03CAULF6nO3M\nSYU/JMWKE6+AAM5RLpR4hNmbhseZb8altHfvMhAgghnxKYWYF33PQHZRST1NCImA\nn3BPEy+nyjgzC+2BrNqai3dzQdv5Rq2X0mW5cg2m3pYQOiFbgwXFNZ1H8QKBgArR\nbXe7YIEiQYCtfv4hK49Bo/8dIseLW/dFXG10RKZr3/a2I+i8IeeEbB5e/S8JzrTN\nB8+gCt0iIeVwKZ22uv3gH7Iahi3Yo3J08dsKXvzMx4FNSn/h/SaJiJbbwAy7ov1s\nQ0C4YOuTPCpmcbqhacENQT8CR/HNyJ2VgYKyuGq5AoGAPwpvmHFicAEC+pZ+mPKW\nGxLdSB9n8H1eEmArhEWNA8m4GdX9fcUEJhV2x29D8aTCHChImGf4ZPh0rYD2Wryu\n4LzUNbO4Tl2CEkFVjIKIlPdWxUUgdpMk11s7DzPENDhg/SZpWKXcxsPQ8pwCRS9h\nVyBGns+cIPcRCwwauw+E+hY=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-4spky@chatapp-678e2.iam.gserviceaccount.com",
  "client_id": "114651446384124559833",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-4spky%40chatapp-678e2.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com",
  }),
});

export const sendPushNotification = async (fcmToken, message) => {
  const payload = {
    notification: {
      title: message.senderName,
      body: message.text,
      icon: message.senderProfile, 
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log('✅ Push notification sent:', response);
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
};
