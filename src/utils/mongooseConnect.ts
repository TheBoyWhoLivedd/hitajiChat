import mongoose from "mongoose";

export function mongooseConnect(){
  if(mongoose.connection.readyState === 1){
    return mongoose.connection.asPromise();
  }else{
    const uri:string = process.env.MONGODB_URI as string;
    return mongoose.connect(uri);
  }
}