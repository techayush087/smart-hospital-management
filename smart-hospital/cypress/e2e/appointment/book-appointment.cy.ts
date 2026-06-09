describe('Book Appointment', () => {
  beforeEach(() => cy.login('patient@test.com', 'Password1!'));

  it('books an appointment end to end', () => {
    cy.visit('/doctors');
    cy.get('[data-cy="doctor-card"]').first().find('[data-cy="book-doctor"]').click();
    cy.get('[data-cy="booking-wizard"]').should('exist');

    // Step 1: pick a date that has seeded slots, then a slot.
    cy.get('[data-cy="slot-date"]').type('2026-06-10');
    cy.get('[data-cy="slot"]').first().click();
    cy.get('[data-cy="wizard-next"]').click();

    // Step 2: dynamic details form.
    cy.get('[data-cy="reason"]').type('Routine checkup');
    cy.get('[data-cy="wizard-next"]').click();

    // Step 3: confirm.
    cy.get('[data-cy="confirm-booking"]').click();
    cy.url().should('include', '/appointments');
  });
});
