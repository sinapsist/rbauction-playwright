import { Locator, Page } from '@playwright/test';

/** Become a seller form shared by the locations directory and a yard page. */
export class SellerComponent {
  constructor(private readonly page: Page) {}

  /** Returns the locator for the "Become a seller" heading. */
  heading(): Locator {
    return this.page.getByRole('heading', { name: 'Become a seller', exact: true });
  }

  /** Returns the locator for the seller phone number. */
  phone(): Locator {
    return this.page.getByText(/\+1[\s.-]*866[\s.-]*901[\s.-]*2104/);
  }

  /** Returns the locator for the form's Submit button. */
  submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  /** Returns the locator for the required first-name message. */
  firstNameError(): Locator {
    return this.page.getByText('First name* is required');
  }

  /** Returns the locator for the required email message. */
  emailError(): Locator {
    return this.page.getByText('Email* is required');
  }

  /** Returns the locator for the Email field. */
  emailField(): Locator {
    return this.page.getByRole('textbox', { name: 'Email*' });
  }

  /** Returns the locator for the invalid email format message. */
  invalidEmailError(): Locator {
    return this.page.getByText('Email address must be a valid address');
  }

  /**
   * Types into the Email field and moves focus away so the form validates it.
   * Nothing is submitted.
   * @param value The text to type in the Email field.
   */
  async enterEmail(value: string): Promise<void> {
    await this.emailField().fill(value);
    await this.emailField().blur();
  }

  /** Returns the locator for a successful submission message. */
  successMessage(): Locator {
    return this.page.getByText(/thank you|successfully submitted/i);
  }

  /** Scrolls the Become a seller form into view. */
  async scrollIntoView(): Promise<void> {
    await this.heading().scrollIntoViewIfNeeded();
  }
}
