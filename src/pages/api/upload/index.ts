// import multer from 'multer';
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getDocument } from 'pdfjs-dist/legacy/build/pdf';

// // Configure multer memory storage
// const storage = multer.memoryStorage();
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === 'application/pdf') {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
//   }
// };

// const upload = multer({ storage, fileFilter });

// // Middleware to handle multer file upload
// const uploadMiddleware = (req, res, next) => {
//   upload.single('pdf')(req, res, (err) => {
//     if (err) {
//       return res.status(401).json({ error: err.message });
//     }
//     next();
//   });
// };

// // Function to read the contents of the PDF file
// const readPdfContent = async (pdfBuffer) => {
//   const uint8Array = new Uint8Array(pdfBuffer);
//   const pdf = await getDocument({ data: uint8Array }).promise;
//   let content = '';
//   console.log("🚀 ~ file: index.ts:31 ~ readPdfContent ~ pdf:", pdf)
//   console.log("🚀 ~ file: index.ts:31 ~ readPdfContent ~ pdf:", pdf.numPages)

//   for (let i = 1; i <= pdf.numPages; i++) {
//     const page = await pdf.getPage(i);
//     const textContent = await page.getTextContent();
//     content += textContent.items.map((item) => item.str).join(' ');
//   }
//   content = content.replace(/\s+/g, ' ');
//   return content;
// };

// // API route handler
// export default async function handler(req:NextApiRequest, res:NextApiResponse) {
//   if (req.method === 'POST') {
//     try {
//       // Process the uploaded file
//       await new Promise((resolve, reject) =>
//         uploadMiddleware(req, res, (result) => {
//           if (result instanceof Error) {
//             return reject(result);
//           }
//           resolve(result);
//         })
//       );

//       // Read the contents of the PDF file
//       const pdfContent = await readPdfContent(req.file.buffer);

//       // Send a response with the PDF contents
//       res.status(200).json({ message: 'File processed successfully', content: pdfContent });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   } else {
//     res.status(405).json({ error: 'Method not allowed' });
//   }
// }

// // Disable Next.js body parser to allow multer to handle the file
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
