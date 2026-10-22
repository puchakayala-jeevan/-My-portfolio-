export interface CoverDimensions {
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
}

export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
}

/**
 * Maps a normalized scroll progress [0, 1] or raw scroll position to a 0-based frame index [0, totalFrames - 1].
 */
export function calculateFrameIndex(
  scrollTop: number,
  maxScroll: number,
  totalFrames: number
): number {
  if (totalFrames <= 1) return 0;
  if (maxScroll <= 0 || scrollTop <= 0) return 0;
  const fraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
  return Math.min(
    totalFrames - 1,
    Math.max(0, Math.floor(fraction * (totalFrames - 1)))
  );
}

/**
 * Calculates object-fit: cover geometry for drawing an image onto a canvas while keeping the center focal point intact.
 */
export function calculateCoverGeometry(
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number,
  focalX = 0.5,
  focalY = 0.42
): CoverDimensions {
  if (canvasWidth <= 0 || canvasHeight <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return { drawWidth: 0, drawHeight: 0, offsetX: 0, offsetY: 0 };
  }
  const canvasRatio = canvasWidth / canvasHeight;
  const imageRatio = imageWidth / imageHeight;

  let drawWidth: number;
  let drawHeight: number;

  if (canvasRatio > imageRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imageRatio;
  } else {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imageRatio;
  }

  const offsetX = (canvasWidth - drawWidth) * focalX;
  const offsetY = (canvasHeight - drawHeight) * focalY;

  return {
    drawWidth: Math.round(drawWidth * 100) / 100,
    drawHeight: Math.round(drawHeight * 100) / 100,
    offsetX: Math.round(offsetX * 100) / 100,
    offsetY: Math.round(offsetY * 100) / 100,
  };
}

/**
 * Validates the contact form fields (Name, Email, Subject, Message).
 */
export function validateContactForm(input: ContactFormInput): ValidationResult {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {};
  const name = (input.name || '').trim();
  const email = (input.email || '').trim();
  const subject = (input.subject || '').trim();
  const message = (input.message || '').trim();

  if (name.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (subject.length < 3) {
    errors.subject = 'Please enter a clear subject (at least 3 characters).';
  }
  if (message.length < 10) {
    errors.message = 'Please enter a message of at least 10 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Builds a properly encoded mailto URI for client-side email fallback.
 */
export function buildMailtoUrl(
  recipientEmail: string,
  input: ContactFormInput
): string {
  const cleanRecipient = recipientEmail.trim();
  const subject = `[Portfolio Inquiry] ${input.subject.trim()}`;
  const bodyLines = [
    `Hello Jeevan,`,
    ``,
    input.message.trim(),
    ``,
    `---`,
    `From: ${input.name.trim()} (${input.email.trim()})`,
  ];
  const params = new URLSearchParams({
    subject,
    body: bodyLines.join('\n'),
  });
  // Replace '+' with '%20' for standard mail client compatibility
  return `mailto:${cleanRecipient}?${params.toString().replace(/\+/g, '%20')}`;
}
