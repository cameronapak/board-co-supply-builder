import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import Plunk from '@plunk/node';
import { PLUNK_EMAIL_API_KEY } from "astro:env/server";

export const email = {
  validateArtwork: defineAction({
    accept: "form",
    input: z.object({
      to: z.string().email(),
      subject: z.string(),
      body: z.string()
    }),
    handler: async ({ to, subject, body }) => {
      const plunk = new Plunk(PLUNK_EMAIL_API_KEY);

      // I want to receive these emails if running on dev.
      let toAddress = 'cameronandrewpak@gmail.com';
      if (import.meta.env.PROD) {
        toAddress = to;
      }

      const { success } = await plunk.emails.send({
        to: toAddress,
        subject,
        body
      })

      // @TODO - consider Effect retry to make sure it sends
      if (!success) {
        throw new ActionError({
          code: "SERVICE_UNAVAILABLE",
          message: "Failed to send email",
        });
      }

      return { success }
    }
  })
};
