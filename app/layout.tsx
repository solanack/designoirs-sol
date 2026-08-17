import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"Designoirs",description:"AI merch infrastructure for Solana projects."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
