// import { getDocument } from "pdfjs-dist/legacy/build/pdf";
// import { getServerSession } from "next-auth/next";
// import { NextApiRequest, NextApiResponse } from "next";
// import { Request, Response, NextFunction } from "express";
// import authOptions from "../auth/[...nextauth]";

// // Function to read the contents of the PDF file
// const readPdfContent = async (pdfBuffer: Buffer) => {
//   const uint8Array = new Uint8Array(pdfBuffer);
//   const pdf = await getDocument({ data: uint8Array }).promise;
//   let content = "";

//   for (let i = 1; i <= pdf.numPages; i++) {
//     const page = await pdf.getPage(i);
//     const textContent = await page.getTextContent();
//     content += textContent.items
//       .map((item) => ("str" in item ? item.str : ""))
//       .join(" ");
//   }
//   content = content.replace(/\s+/g, " ");
//   return content;
// };

// interface NextApiRequestWithFile extends NextApiRequest {
//   file: Express.Multer.File;
// }

// export default async function handler(
//   req: Request | NextApiRequestWithFile,
//   res: NextApiResponse
// ) {
//   const session = await getServerSession(req, res, authOptions);
//   if (session) {
//     if (req.method === "POST") {
//       try {
//         const pdfContent = req.file && (await readPdfContent(req.file.buffer));
//         res.status(200).send({ pdfContent });
//       } catch (error: any) {
//         res.status(500).json({ error: error.message });
//       }
//     } else {
//       res.status(405).json({ error: "Method not allowed" });
//     }
//   } else {
//     res.status(401).json({ success: false, message: "Please Login" });
//   }
//   res.end();
// }


