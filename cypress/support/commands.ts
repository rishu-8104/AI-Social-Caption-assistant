/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      uploadFile(fileName: string, fileType?: string, selector?: string): Chainable<Element>
      selectPlatforms(platforms: string[]): Chainable<Element>
      waitForImageLoad(): Chainable<Element>
      checkAccessibility(): Chainable<Element>
    }
  }
}

// Custom command to upload a file
Cypress.Commands.add('uploadFile', (fileName: string, fileType = 'image/jpeg', selector = 'input[type="file"]') => {
  cy.fixture(fileName, 'base64').then(fileContent => {
    const blob = Cypress.Blob.base64StringToBlob(fileContent, fileType)
    const file = new File([blob], fileName, { type: fileType })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)

    cy.get(selector).then(input => {
      const el = input[0] as HTMLInputElement
      el.files = dataTransfer.files
      el.dispatchEvent(new Event('change', { bubbles: true }))
    })
  })
})

// Custom command to select platforms
Cypress.Commands.add('selectPlatforms', (platforms: string[]) => {
  platforms.forEach(platform => {
    cy.get(`input[aria-label="Generate caption for ${platform}"]`).check()
  })
})

// Custom command to wait for image to load
Cypress.Commands.add('waitForImageLoad', () => {
  cy.get('img[alt="Uploaded image"]', { timeout: 10000 }).should('be.visible')
})

// Custom command for basic accessibility checks
Cypress.Commands.add('checkAccessibility', () => {
  // Check for main landmark
  cy.get('main').should('exist')

  // Check for heading hierarchy
  cy.get('h1').should('exist')

  // Check for proper form labels
  cy.get('input, textarea, select').each($el => {
    const id = $el.attr('id')
    const ariaLabel = $el.attr('aria-label')
    const ariaLabelledby = $el.attr('aria-labelledby')

    if (id) {
      cy.get(`label[for="${id}"]`).should('exist')
    } else {
      expect(ariaLabel || ariaLabelledby).to.exist
    }
  })

  // Check for focus indicators
  cy.get('button, input, textarea, select, a[href]').each($el => {
    cy.wrap($el).focus().should('have.focus')
  })
})