describe('Reschedule', () => {
  beforeEach(() => cy.login('patient@test.com', 'Password1!'));

  it('opens the reschedule flow for an existing appointment', () => {
    cy.visit('/appointments');
    cy.get('[data-cy="reschedule-appointment"]').first().click();
    cy.get('[data-cy="reschedule-confirm"]').should('exist');
  });
});
