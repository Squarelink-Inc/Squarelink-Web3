/* eslint-disable */

export class SqlkError extends Error {
  constructor(msg) {
    super(msg)
    this.name = '[Squarelink Error]'
  }
}
