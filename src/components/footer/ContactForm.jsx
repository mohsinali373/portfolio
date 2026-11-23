import { useRef, useState } from 'react';
import { emailjsConfig, profile } from '../../data/content';
import { Icon } from '../ui/Icon';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 3000;

/** @typedef {'idle' | 'sending' | 'success' | 'error'} SendStatus */

/**
 * @param {FormData} data
 * @returns {Record<string, string>} field → error message
 */
function validate(data) {
  const errors = {};
  const name = String(data.get('first_name') ?? '').trim();
  const email = String(data.get('user_email') ?? '').trim();
  const message = String(data.get('message') ?? '').trim();
  if (!name) errors.first_name = 'Please tell me your name.';
  if (!EMAIL_PATTERN.test(email)) errors.user_email = 'Enter a valid email so I can reply.';
  if (message.length < MESSAGE_MIN) errors.message = `A few more words, please (at least ${MESSAGE_MIN} characters).`;
  if (message.length > MESSAGE_MAX) errors.message = `Please keep it under ${MESSAGE_MAX} characters.`;
  return errors;
}

const STATUS_COPY = {
  success: 'Thanks — your message is on its way. I usually reply within a day.',
  error: `That didn’t send. Please email me directly at ${profile.email}.`,
};

function Field({ id, label, error, isTextarea = false, ...inputProps }) {
  const errorId = `${id}-error`;
  const shared = {
    id,
    name: id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    ...inputProps,
  };
  return (
    <div className={`lfield${error ? ' has-error' : ''}${isTextarea ? ' lfield--wide' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {isTextarea ? <textarea rows={2} {...shared} /> : <input {...shared} />}
      {error && (
        <p id={errorId} className="lfield__error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Contact form posting to EmailJS with the same field names as the original site's template. */
export function ContactForm() {
  const formRef = useRef(/** @type {HTMLFormElement | null} */ (null));
  const [status, setStatus] = useState(/** @type {SendStatus} */ ('idle'));
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = formRef.current;
    if (!form || status === 'sending') return;

    const data = new FormData(form);
    if (String(data.get('company_website') ?? '') !== '') return; // honeypot: bots fill hidden fields

    const nextErrors = validate(data);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      form.querySelector(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus('sending');
    try {
      const emailjs = await import('@emailjs/browser');
      await emailjs.sendForm(emailjsConfig.serviceId, emailjsConfig.templateId, form, {
        publicKey: emailjsConfig.publicKey,
      });
      setStatus('success');
      form.reset();
    } catch (error) {
      console.error('Contact form: EmailJS send failed', error);
      setStatus('error');
    }
  };

  const isSending = status === 'sending';
  const statusText = status === 'success' || status === 'error' ? STATUS_COPY[status] : '';

  return (
    <form ref={formRef} className="lform" onSubmit={handleSubmit} noValidate>
      <Field id="first_name" label="Your name" autoComplete="name" required error={errors.first_name} />
      <Field id="user_email" label="Email" type="email" autoComplete="email" inputMode="email" required error={errors.user_email} />
      <Field id="message" label="What are we building?" isTextarea required maxLength={MESSAGE_MAX} error={errors.message} />
      <input type="hidden" name="last_name" value="" />

      <div className="lform__honeypot" aria-hidden="true">
        <label htmlFor="company_website">Leave this field empty</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="lform__submit">
        <button className="btn btn--primary" type="submit" disabled={isSending}>
          {isSending ? 'Sending…' : 'Send message'}
          <Icon name="arrowUpRight" />
        </button>
        <p className={`lform__status lform__status--${status}`} role="status" aria-live="polite">
          {statusText}
        </p>
      </div>
    </form>
  );
}
