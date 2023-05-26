
// import fs from "fs";
// import path from "path";
// import csv from "csv-parser";
import GPT3TokenizerImport from "gpt3-tokenizer";

export function cosinesim(A: number[], B: number[]): number {
  let dotproduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < A.length; i++) {
    dotproduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  const similarity = dotproduct / (mA * mB);
  return similarity;
}

// export function load_data(): () => Promise<
//   Array<{ text: string; vector: number[] }>
// > {
//   let results: Array<{ text: string; vector: number[] }> = [];

//   return function () {
//     return new Promise((resolve, reject) => {
//       if (results.length > 0) {
//         resolve(results);
//         return;
//       }

//       const fileDirectory = path.join(
//         process.cwd(),
//         "incomeTaxFullEmbeddings.csv"
//       );
//       fs.createReadStream(fileDirectory)
//         .pipe(csv())
//         .on("data", (data: { text: string; embedding: string }) => {
//           const { text, embedding } = data;
//           const vector = JSON.parse(embedding);
//           results.push({ text, vector });
//         })
//         .on("end", () => {
//           resolve(results);
//         })
//         .on("error", (err: Error) => {
//           reject(err);
//         });
//     });
//   };
// }

const GPT3Tokenizer: typeof GPT3TokenizerImport =
  typeof GPT3TokenizerImport === "function"
    ? GPT3TokenizerImport
    : (GPT3TokenizerImport as any).default;

const tokenizer = new GPT3Tokenizer({ type: "gpt3" });

export function getTokens(input: string): number {
  const tokens = tokenizer.encode(input);
  return tokens.text.length;
}
