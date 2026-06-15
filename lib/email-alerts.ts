import { getResend } from "./email";

export async function sendBudgetAlert(
  email: string,
  subject: string,
  message: string
) {
  const { data, error } = await getResend().emails.send({
    from: "WHOAI <onboarding@resend.dev>",
    to: [email],
    subject,
    html: `<p>${message}</p>`,
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}