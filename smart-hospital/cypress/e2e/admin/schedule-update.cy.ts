describe('Admin Schedule', () => {
  beforeEach(() => cy.login('admin@test.com', 'Password1!'));

  it('views doctor schedules', () => {
    cy.visit('/admin/schedules');
    cy.get('[data-cy="add-slot"]').should('exist');
  });

  it('updates a consultation status', () => {
    cy.visit('/admin/records');
    cy.get('[data-cy="patient-row"]').should('exist');
    cy.get('[data-cy="status-select"]').first().select('completed');
    cy.get('[data-cy="status-updated"]').should('exist');
  });

  it('blocks a patient from the admin area', () => {
    // Re-login as patient and attempt to reach admin.
    cy.visit('/auth/login');
    cy.get('[data-cy="email"]').clear().type('patient@test.com');
    cy.get('[data-cy="password"]').clear().type('Password1!');
    cy.get('[data-cy="submit"]').click();
    cy.visit('/admin/dashboard');
    cy.url().should('not.include', '/admin');
  });
});
