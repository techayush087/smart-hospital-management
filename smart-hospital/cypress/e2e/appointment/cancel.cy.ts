describe('Cancel', () => {
  beforeEach(() => cy.login('patient@test.com', 'Password1!'));

  it('cancels an upcoming appointment', () => {
    cy.visit('/appointments');
    cy.get('[data-cy="cancel-appointment"]').first().click();
    // After cancel the appointment status updates; the row should reflect a cancelled badge
    // or move out of the upcoming list. We assert the page is still the appointments view.
    cy.url().should('include', '/appointments');
    cy.contains(/cancelled|canceled/i).should('exist');
  });
});
