describe('View History', () => {
  beforeEach(() => cy.login('patient@test.com', 'Password1!'));

  it('shows visit history', () => {
    cy.visit('/patient/history');
    cy.contains(/Dr\. /).should('be.visible');
  });

  it('shows prescriptions', () => {
    cy.visit('/patient/prescriptions');
    cy.contains(/Metoprolol|Tretinoin/).should('be.visible');
  });
});
