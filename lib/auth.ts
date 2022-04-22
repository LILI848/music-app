import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "./prisma";

// higher order function wrap of handler
export const validateRoute = (handler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { TRAX_ACCESS_TOKEN: token } = req.cookies;
    // const token=req.cookies.TRAX_ACCESS_TOKEN
    if (token) {
      // check the token from the cookie
      // if true tocken
      let user;
      try {
        // decode the jwt, turn it into an object
        const { id } = jwt.verify(token, "hello");
        // go to database find the user with the id
        user = await prisma.user.findUnique({
          where: { id },
        });
        // if no valid user
        if (!user) {
          throw new Error("Not real user");
        }
      } catch (error) {
        // if error
        res.status(401);
        res.json({ error: "Not Authorized" });
        return;
      }
      // user is true then call the original handler
      // once get the user pass it along to the next handler
      return handler(req, res, user);
    }
    // if false token
    res.status(401);
    res.json({ error: "Not Authorized" });
  };
};

export const validateToken = (token) => {
  const user = jwt.verify(token, "hello");
  return user;
};
