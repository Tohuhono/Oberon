/**
 * Returns a promise that resolves after @param ms
 */
export function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Returns a quasi random integer with
 * @param start lower bound
 * @param range
 */
export function getRandomInt(start: number, range: number) {
  return Math.floor(Math.random() * range + start)
}

/**
 * Turn a promise into a react suspense object
 * @param promise
 * @returns an object with a read method that either
 * 1) throws the current promise
 * 2) throws an error
 * 3) returns the result
 */
export function suspend<T>(promise: Promise<T>) {
  let status = "pending"

  // 1. Keep track of the Promise's state. The `status`
  //    variable will update as the Promise moves from
  //    pending to success or error.
  let result: T
  const suspender = promise.then(
    (res) => {
      // On success, update the status to "success"
      status = "success"
      result = res
    },
    (error) => {
      // On error, update the status to "error"
      status = "error"
      result = error
    },
  )

  // 2. Return an object with a `read()` method that does one
  //    of the following:
  //
  //    a) Returns the Promise's resolved value if it's resolved.
  //    b) Sends a signal to a Suspense Boundary if the Promise is pending.
  //    c) Sends a signal to an Error Boundary if the Promise failed.
  return {
    read() {
      if (status === "pending") {
        // Pending promises are thrown and caught by <Suspense />.
        // FYI: Anything can be thrown in JavaScript, not just Errors.
        throw suspender
      } else if (status === "error") {
        // Errors are thrown too, but are caught by an Error Boundary.
        throw result
      } else if (status === "success") {
        // Finally, the Promise result is returned once it's resolved.
        return result
      }
    },
  }
}
