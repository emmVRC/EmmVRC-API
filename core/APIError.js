class APIError extends Error {
    constructor(code, message, obj) {

        super(message);

        if (message === "object")
            this.obj = obj

        if (Error.captureStackTrace)
            Error.captureStackTrace(this, APIError);

        this.name = "APIError";
        this.code = code;
        this.date = new Date();
    }
}

module.exports = APIError;