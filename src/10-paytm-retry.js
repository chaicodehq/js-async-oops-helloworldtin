/**
 * 💳 Paytm Payment System - Error Handling: try/catch, Custom Errors, Retry
 *
 * Paytm payment system mein transactions fail ho sakti hain — balance kam,
 * network issue, ya fraud detected! Custom error classes banao taaki har
 * error type ko alag handle kar sako. Retry logic se network errors pe
 * dubara try karo, lekin fraud pe turant band karo.
 *
 * Custom Error Classes (all extend Error or PaymentError):
 *
 *   PaymentError extends Error
 *     - constructor(message, code, amount)
 *     - this.name = "PaymentError"
 *     - this.code = code (string error code)
 *     - this.amount = amount (transaction amount)
 *
 *   InsufficientFundsError extends PaymentError
 *     - constructor(amount, balance)
 *     - message: "Insufficient funds: need ${amount}, have ${balance}"
 *     - code: "INSUFFICIENT_FUNDS"
 *     - this.name = "InsufficientFundsError"
 *     - this.balance = balance
 *
 *   NetworkError extends PaymentError
 *     - constructor(amount)
 *     - message: "Network error during transaction"
 *     - code: "NETWORK_ERROR"
 *     - this.name = "NetworkError"
 *     - this.retryable = true
 *
 *   FraudDetectedError extends PaymentError
 *     - constructor(amount)
 *     - message: "Suspicious transaction detected"
 *     - code: "FRAUD_DETECTED"
 *     - this.name = "FraudDetectedError"
 *     - this.retryable = false
 *
 *
 * Function: processPayment(amount, balance, networkStatus)
 *   - async function
 *   - Validates and throws appropriate custom errors:
 *     - If amount is not a positive number: throw PaymentError("Invalid amount", "INVALID_AMOUNT", amount)
 *     - If amount > balance: throw new InsufficientFundsError(amount, balance)
 *     - If networkStatus === "offline": throw new NetworkError(amount)
 *     - If amount > 100000: throw new FraudDetectedError(amount)
 *   - If all valid: return {
 *       transactionId: "TXN" + Math.floor(Math.random() * 1000000),
 *       amount,
 *       status: "success",
 *       timestamp: new Date().toISOString()
 *     }
 *   - Simulate small delay (~50ms)
 *
 * Function: retryPayment(paymentFn, maxRetries, delayMs)
 *   - async function
 *   - paymentFn is a function that returns a Promise (like () => processPayment(...))
 *   - Calls paymentFn. If it succeeds, return result.
 *   - If it fails with NetworkError: retry up to maxRetries times
 *     Wait delayMs between each retry
 *   - If it fails with any OTHER error: re-throw immediately (no retry)
 *   - If all retries exhausted: throw the last NetworkError
 *   - maxRetries must be >= 0, delayMs must be > 0
 *
 * Function: processWithFallback(primaryFn, fallbackFn)
 *   - async function
 *   - Tries primaryFn() first
 *   - If it succeeds: return result
 *   - If it fails: try fallbackFn()
 *   - If fallback succeeds: return its result
 *   - If both fail: throw new PaymentError(
 *       "Primary: ${primaryError.message}, Fallback: ${fallbackError.message}",
 *       "BOTH_FAILED", 0)
 *
 * Function: categorizeError(error)
 *   - Synchronous function (not async)
 *   - Takes an error object and returns a categorization:
 *   - If error instanceof InsufficientFundsError:
 *     { type: "insufficient_funds", retryable: false, message: error.message }
 *   - If error instanceof NetworkError:
 *     { type: "network", retryable: true, message: error.message }
 *   - If error instanceof FraudDetectedError:
 *     { type: "fraud", retryable: false, message: error.message }
 *   - Otherwise:
 *     { type: "unknown", retryable: false, message: error.message || "Unknown error" }
 *
 * Rules:
 *   - Custom errors must properly extend their parent class
 *   - Always use `super()` in error constructors
 *   - instanceof checks must work correctly through the hierarchy
 *   - retryPayment ONLY retries NetworkError, everything else re-throws
 *   - processPayment checks conditions in order: invalid amount, insufficient funds,
 *     network, fraud — first matching condition triggers
 *   - Delay between retries should use actual setTimeout/Promise delay
 *
 * @example
 *   try {
 *     await processPayment(500, 100, "online");
 *   } catch (e) {
 *     console.log(e instanceof InsufficientFundsError); // true
 *     console.log(e.code);    // "INSUFFICIENT_FUNDS"
 *     console.log(e.balance); // 100
 *   }
 *
 * @example
 *   const result = await retryPayment(
 *     () => processPayment(100, 500, "online"),
 *     3, 100
 *   );
 *   // => { transactionId: "TXN...", amount: 100, status: "success", ... }
 *
 * @example
 *   categorizeError(new NetworkError(500));
 *   // => { type: "network", retryable: true, message: "Network error during transaction" }
 */
export class PaymentError extends Error {
  constructor(message, code, amount) {
    super(message);
    this.name = "PaymentError";
    this.code = code;
    this.amount = amount;
  }
}

export class InsufficientFundsError extends PaymentError {
  constructor(amount, balance) {
    super(
      `Insufficient funds: need ${amount}, have ${balance}`,
      "INSUFFICIENT_FUNDS",
      amount,
    );
    this.name = "InsufficientFundsError";
    this.balance = balance;
  }
}

export class NetworkError extends PaymentError {
  constructor(amount) {
    super("Network error during transaction", "NETWORK_ERROR", amount);
    this.name = "NetworkError";
    this.retryable = true;
  }
}

export class FraudDetectedError extends PaymentError {
  constructor(amount) {
    super("Suspicious transaction detected", "FRAUD_DETECTED", amount);
    this.name = "FraudDetectedError";
    this.retryable = false;
  }
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("time up");
    }, ms);
  });
}

export async function processPayment(amount, balance, networkStatus) {
  if (typeof amount !== "number" || amount <= 0)
    throw new PaymentError("Invalid amount", "INVALID_AMOUNT", amount);

  if (amount > balance) throw new InsufficientFundsError(amount, balance);

  if (networkStatus === "offline") throw new NetworkError(amount);

  if (amount > 100000) throw new FraudDetectedError(amount);

  await delay(100);

  return {
    transactionId: "TXN" + Math.floor(Math.random() * 1000000),
    amount,
    status: "success",
    timestamp: new Date().toISOString(),
  };
}

export async function retryPayment(paymentFn, maxRetries, delayMs) {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const res = await paymentFn();
      return res;
    } catch (error) {
      if (error instanceof NetworkError) {
        await delay(delayMs);
        lastError = error;
        continue;
      }

      throw error;
    }
  }
  throw lastError;
}

export async function processWithFallback(primaryFn, fallbackFn) {
  let primaryError;

  try {
    const res = await primaryFn();
    return res;
  } catch (error) {
    primaryError = error;
  }

  let fallbackError;
  try {
    const res = await fallbackFn();
    return res;
  } catch (error) {
    fallbackError = error;
  }

  throw new PaymentError(
    `Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`,
    "BOTH_FAILED",
    0,
  );
}

export function categorizeError(error) {
  if (error instanceof InsufficientFundsError) {
    return {
      type: "insufficient_funds",
      retryable: false,
      message: error.message,
    };
  } else if (error instanceof NetworkError) {
    return {
      type: "network",
      retryable: true,
      message: error.message,
    };
  } else if (error instanceof FraudDetectedError) {
    return {
      type: "fraud",
      retryable: false,
      message: error.message,
    };
  }

  return {
    type: "unknown",
    retryable: false,
    message: error.message || "Unknown error",
  };
}
