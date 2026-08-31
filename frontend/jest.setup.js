import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'node:util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

if (!global.File.prototype.text) {
  global.File.prototype.text = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const text = new TextDecoder().decode(new Uint8Array(reader.result))
        resolve(text)
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this)
    })
  }
}