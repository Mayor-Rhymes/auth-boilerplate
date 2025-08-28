import crypto from "crypto";

export const generateRandomString = () => {
  // Generate 12 random bytes (like Go's rand.Read)
  const bytes = crypto.randomBytes(12);

  // Encode in Base32
  return bytes.toString("base64");
};
