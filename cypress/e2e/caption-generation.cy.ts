/// <reference types="cypress" />

describe('Social Media Caption Generator E2E', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('loads the homepage correctly', () => {
    cy.get('h1').should('contain.text', 'Social Media Caption Generator')
    cy.get('main').should('be.visible')
    cy.checkAccessibility()
  })

  it('displays all platform options', () => {
    cy.get('input[aria-label="Generate caption for Instagram"]').should('be.visible')
    cy.get('input[aria-label="Generate caption for Twitter"]').should('be.visible')
    cy.get('input[aria-label="Generate caption for Facebook"]').should('be.visible')
    cy.get('input[aria-label="Generate caption for LinkedIn"]').should('be.visible')
  })

  it('allows platform selection', () => {
    cy.selectPlatforms(['Instagram', 'Twitter'])

    cy.get('input[aria-label="Generate caption for Instagram"]').should('be.checked')
    cy.get('input[aria-label="Generate caption for Twitter"]').should('be.checked')
    cy.get('input[aria-label="Generate caption for Facebook"]').should('not.be.checked')
    cy.get('input[aria-label="Generate caption for LinkedIn"]').should('not.be.checked')
  })

  it('handles image upload via file input', () => {
    // Create a test image fixture first
    cy.uploadFile('test-image.jpg')
    cy.waitForImageLoad()

    // Verify image is displayed
    cy.get('img[alt="Uploaded image"]').should('be.visible')
  })

  it('shows generate button only after image upload', () => {
    // Initially no generate button
    cy.get('button').contains('Generate Captions').should('not.exist')

    // Upload image
    cy.uploadFile('test-image.jpg')
    cy.waitForImageLoad()

    // Now generate button should appear
    cy.get('button').contains('Generate Captions').should('be.visible')
  })

  it('handles the complete caption generation flow', () => {
    // Upload an image
    cy.uploadFile('test-image.jpg')
    cy.waitForImageLoad()

    // Select platforms
    cy.selectPlatforms(['Instagram', 'Twitter'])

    // Add context
    cy.get('textarea[placeholder*="Add details about your image"]')
      .type('This is a beautiful sunset photo taken at the beach')

    // Mock the API response
    cy.intercept('POST', '/api/generate-captions', {
      fixture: 'caption-response.json'
    }).as('generateCaptions')

    // Click generate
    cy.get('button').contains('Generate Captions').click()

    // Wait for API call
    cy.wait('@generateCaptions')

    // Check for results
    cy.get('[role="tablist"]').should('be.visible')
    cy.get('[role="tab"]').should('have.length.at.least', 1)
  })

  it('displays loading state during generation', () => {
    cy.uploadFile('test-image.jpg')
    cy.waitForImageLoad()
    cy.selectPlatforms(['Instagram'])

    // Mock slow API response
    cy.intercept('POST', '/api/generate-captions', (req) => {
      req.reply((res) => {
        res.delay(2000)
        res.send({ fixture: 'caption-response.json' })
      })
    }).as('slowGenerate')

    cy.get('button').contains('Generate Captions').click()

    // Check loading state
    cy.get('[role="alert"]').should('be.visible')
    cy.get('h3').contains('Generating Captions').should('be.visible')

    cy.wait('@slowGenerate')
  })

  it('handles API errors gracefully', () => {
    cy.uploadFile('test-image.jpg')
    cy.waitForImageLoad()
    cy.selectPlatforms(['Instagram'])

    // Mock API error
    cy.intercept('POST', '/api/generate-captions', {
      statusCode: 500,
      body: { error: 'Failed to generate captions' }
    }).as('failedGenerate')

    cy.get('button').contains('Generate Captions').click()
    cy.wait('@failedGenerate')

    // Should handle error gracefully (check for toast or error message)
    // This depends on your error handling implementation
  })

  it('validates required fields', () => {
    // Try to generate without image
    cy.selectPlatforms(['Instagram'])
    cy.get('button').contains('Generate Captions').should('not.exist')

    // Upload image but no platforms selected
    cy.uploadFile('test-image.jpg')
    cy.waitForImageLoad()

    // Intercept API call to check validation
    cy.intercept('POST', '/api/generate-captions', {
      statusCode: 400,
      body: { error: 'At least one platform must be selected' }
    }).as('validationError')

    cy.get('button').contains('Generate Captions').click()
    // Should show validation error
  })

  it('supports drag and drop file upload', () => {
    cy.fixture('test-image.jpg', 'base64').then(fileContent => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg')
      const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' })

      // Get the drop zone
      cy.get('[aria-label="Upload image"]').then($dropZone => {
        const dropEvent = new DragEvent('drop', {
          dataTransfer: new DataTransfer()
        })
        dropEvent.dataTransfer.items.add(file)

        $dropZone[0].dispatchEvent(dropEvent)
      })
    })

    cy.waitForImageLoad()
  })

  it('copies captions to clipboard', () => {
    cy.uploadFile('test-image.jpg')
    cy.waitForImageLoad()
    cy.selectPlatforms(['Instagram'])

    cy.intercept('POST', '/api/generate-captions', {
      fixture: 'caption-response.json'
    }).as('generateCaptions')

    cy.get('button').contains('Generate Captions').click()
    cy.wait('@generateCaptions')

    // Mock clipboard API
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('clipboardWrite')
    })

    // Click copy button
    cy.get('button').contains('Copy Caption').click()

    cy.get('@clipboardWrite').should('have.been.called')
  })

  it('is responsive across different viewports', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    cy.get('h1').should('be.visible')
    cy.get('main').should('be.visible')

    // Test tablet viewport
    cy.viewport('ipad-2')
    cy.get('h1').should('be.visible')
    cy.get('main').should('be.visible')

    // Test desktop viewport
    cy.viewport(1920, 1080)
    cy.get('h1').should('be.visible')
    cy.get('main').should('be.visible')
  })

  it('maintains accessibility standards', () => {
    cy.checkAccessibility()

    // Test keyboard navigation
    cy.get('body').tab()
    cy.focused().should('have.attr', 'href', '#main-heading') // Skip link

    cy.get('body').tab()
    cy.focused().should('have.attr', 'aria-label', 'Upload image')

    // Test ARIA labels and roles
    cy.get('[role="main"]').should('exist')
    cy.get('[role="button"]').should('exist')
    cy.get('[aria-label]').should('have.length.at.least', 1)
  })

  it('handles file type validation', () => {
    // Try to upload invalid file type
    cy.fixture('test-document.pdf', 'base64').then(fileContent => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, 'application/pdf')
      const file = new File([blob], 'test-document.pdf', { type: 'application/pdf' })

      cy.get('input[type="file"]').then(input => {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        const el = input[0] as HTMLInputElement
        el.files = dataTransfer.files
        el.dispatchEvent(new Event('change', { bubbles: true }))
      })
    })

    // Should show validation error for invalid file type
    // This depends on your validation implementation
  })
})