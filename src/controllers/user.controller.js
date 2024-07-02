import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // storing refresh token in db
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, " Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation(to see if provided data is valid i.e. not empty, in proper format, etc)
  // check if user already exists: check by username, email
  // check if avatar(required) and images
  // upload them on cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const { fullName, email, username, password } = req.body; // if data is coming from form or json, it is in req.body
  console.log("email:", email);
  console.log(req.body);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  // checking if coverImage is there
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url, // only keep the url in db
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // With every entry in db, mongodb adds a "_id" field automatically

  const createdUser = await User.findById(user._id).select(
    // by default all fields are selected, so to remove some fields we use this .select method, in string write with "-...remove.. -..remove.."
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  } else {
    console.log(req.body);
    console.log(req.files);
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user 
    // check password
    // access and refresh token
    // send cookies
    
    const {email,username, password} = req.body
    if(!username && !email) {
        throw new ApiError(400,"username or email is required")
    }

    // User - mongoose object
    const user = await User.findOne({
        // mongodb operators - $and, $or, $nor
        $or: [{username}, {email}]
     })

     if(!user) {
        throw new ApiError(404, "User does not exist")
     }

     const isPasswordValid = await user.isPasswordCorrect(password)
     if(!isPasswordValid) {
        throw new ApiError(401, "Password Incorrect")
     }

     const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
     // options of cookies
     const options = {
        httpOnly: true,
        secure: true
     }
     // by doing this, cookies are only modifiable by server
    
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken" ,refreshToken, options)
     .json(
        new ApiResponse(
            200, {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
     )

});

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
     }
     return res
     .status(200)
     .clearCookie("accessToken", options)
     .clearCookie("refreshToken", options)
     .json(new ApiResponse(200, {}, "user logged out successfully"))
})

const refreshAccessToken = asyncHandler(async(req,res) => {
    try {
        const incomingRequestToken = req.cookies.refreshToken || req.body.refreshToken
    
        if(incomingRequestToken) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(incomingRequestToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if(incomingRequestToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, {
                    accessToken, newRefreshToken
                },
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }

})

export { registerUser, loginUser, logoutUser, refreshAccessToken };