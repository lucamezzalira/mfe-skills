/*
 * Example architecture fitness tests (template only).
 * Adjust glob paths and package aliases to your repository.
 */

const { filesOfProject, satisfy } = require('ts-arch')

const mfes = ['AppShell', 'HomeMFE', 'CatalogueMFE', 'MyAccount', 'UserDetails', 'UserPaymentMethods']

describe('MFE boundary fitness functions', () => {
  test('MFEs do not import code from other MFE source folders', async () => {
    for (const from of mfes) {
      const others = mfes.filter((m) => m !== from)
      for (const to of others) {
        await expect(
          filesOfProject()
            .inFolder(`${from}/src`)
            .shouldNot()
            .dependOnFiles()
            .inFolder(`${to}/src`),
        ).toPassAsync()
      }
    }
  })

  test('Shared imports are limited to explicit allowlist areas', async () => {
    // Adjust aliases to match your tooling (webpack/vite/tsconfig paths).
    await expect(
      filesOfProject()
        .inAnyFolder(mfes.map((m) => `${m}/src`))
        .should(satisfy(({ importedModule }) => {
          if (!importedModule.startsWith('@shared/')) return true
          return (
            importedModule.startsWith('@shared/contracts/') ||
            importedModule.startsWith('@shared/platform/') ||
            importedModule.startsWith('@shared/ui-primitives/')
          )
        })),
    ).toPassAsync()
  })
})
