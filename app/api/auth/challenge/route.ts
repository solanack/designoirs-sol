import {cookies} from "next/headers";
export async function POST(){const nonce=crypto.randomUUID(),message=`Sign in to Designoirs\n\nNonce: ${nonce}\nThis request does not create a transaction or cost SOL.`;(await cookies()).set("designoirs_challenge",nonce,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:300});return Response.json({message})}
