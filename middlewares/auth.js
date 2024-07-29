import jwt from 'jsonwebtoken'

export const ensureAuth = (req, res, next) => {
  // Check if the authorization header is present
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: 'error',
      message: 'Authorization header not present'
    })
  }

  // Clean the token and remove quotes
  const token = req.headers.authorization.replace(/['"]+/g, '')

  try {
    jwt.verify(token, process.env.SECRET_KEY_JWT, (error, decode) => {
      if (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            status: 'error',
            message: 'Token expired'
          })
        } else {
          console.log(error)
          return res.status(403).json({
            status: 'error',
            message: 'Invalid token'
          })
        }
      } else {
        req.user = decode
        next()
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(403).json({
      status: 'error',
      message: 'Invalid token'
    })
  }
}
