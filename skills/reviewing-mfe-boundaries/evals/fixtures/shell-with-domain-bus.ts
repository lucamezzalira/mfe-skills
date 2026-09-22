import { platformBus } from './bus'

export function registerShellHandlers() {
  platformBus.on('catalog:productSelected', ({ id }) => {
    console.log('selected', id)
  })
}
