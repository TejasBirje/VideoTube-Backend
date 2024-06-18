// We made this so that the errors we get will be streamlined i.e. in a fixed format. Now node has Error class, but for response we are using express and express doesnt have any Error class

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}