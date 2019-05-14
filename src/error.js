/* eslint-disable */

export class SqlkError extends Error {
  constructor(msg) {
    super('Squarelink: ' + msg)
    this.name = 'SquarelinkError'
  }
}
