export async function consoleMailProvider({ server, email }) {
  server.log.info(
    { to: email.to, subject: email.subject, text: email.text },
    'Email logged by the console mail provider',
  );
}
