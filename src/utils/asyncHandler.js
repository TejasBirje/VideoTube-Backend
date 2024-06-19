const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}



export { asyncHandler }



// A higher order function, they take function in parameter and return function. Basically they treat functions as variable

/*
const asycHandler = () => {}
const asyncHandler = (func) => {}
const asyncHandler = () => () => {}
const asyncHandler = () => async () => {}
*/


// Try catch method

// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }