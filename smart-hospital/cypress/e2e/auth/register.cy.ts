describe('Register', () => {
  beforeEach(() => cy.visit('/auth/register'));

  it('shows an age validation error for an under-18 DOB', () => {
    cy.get('[data-cy="dateOfBirth"]').type('2020-01-01').blur();
    cy.contains(/18|age/i).should('be.visible');
  });

  it('shows a password mismatch error', () => {
    cy.get('[data-cy="password"]').type('Password1!');
    cy.get('[data-cy="confirmPassword"]').type('Different1!').blur();
    cy.contains(/match/i).should('be.visible');
  });

  it('registers a new patient then returns to login', () => {
    const email = `new${Date.now()}@test.com`;
    cy.get('[data-cy="firstName"]').type('New');
    cy.get('[data-cy="lastName"]').type('Patient');
    cy.get('[data-cy="email"]').type(email);
    cy.get('[data-cy="password"]').type('Password1!');
    cy.get('[data-cy="confirmPassword"]').type('Password1!');
    cy.get('[data-cy="dateOfBirth"]').type('1995-04-10');
    cy.get('[data-cy="phone"]').type('+12223334444');
    cy.get('[data-cy="submit"]').click();
    cy.url().should('include', '/auth/login');
  });
});
