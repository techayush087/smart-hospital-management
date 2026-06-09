describe('Login', () => {
  it('logs in as patient and leaves the login page', () => {
    cy.login('patient@test.com', 'Password1!');
    cy.url().should('include', '/patient');
  });

  it('logs in as admin and leaves the login page', () => {
    cy.login('admin@test.com', 'Password1!');
    cy.url().should('include', '/admin');
  });

  it('shows an error for invalid credentials', () => {
    cy.visit('/auth/login');
    cy.get('[data-cy="email"]').type('patient@test.com');
    cy.get('[data-cy="password"]').type('wrongpass');
    cy.get('[data-cy="submit"]').click();
    cy.contains(/invalid|incorrect|failed/i).should('be.visible');
    cy.url().should('include', '/auth/login');
  });
});
