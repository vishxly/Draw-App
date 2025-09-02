'use server'
import  file  from "../models/file";
import  user  from "../models/user";
import DBconnection from "../mongodb";



//create 
export const createFile = async ({ userId, fileName, whiteboard, document }: { userId: string; fileName: string; whiteboard?: string; document?: string }) => {
    try {
        if (!userId || !fileName) {
            // throw new Error('userId and fileName are required');
            return null;
        }

        await DBconnection();

        // Validating user
        const finduser = await user.findOne({ _id: userId });
        if (!finduser) {
            throw new Error('User not found');
        }
        if (finduser.plan == 'free' && finduser.project.length >= 5) {
          console.log('reached max limit');
          return null;
        }
        let newDocument = document;
        let newWhiteboard = whiteboard;

        if (!whiteboard) {
          newWhiteboard=''
        }
        if (!document) {
            newDocument = '';
        }
       
        const createNewFile = await file.create({
            fileName: fileName,
            whiteboard: newWhiteboard,
            document: newDocument,
            createdBy: finduser._id
        })
        
         
        const updateUser = await user.findByIdAndUpdate(
          userId,
          {
            $push: {
              project: {
                fileId: createNewFile._id,
                fileName: createNewFile.fileName,
                userName: finduser.userName,
              },
            },
          },
          { new: true }
        );

        if (!updateUser) {
            throw new Error('Failed to update user with the project ID');
        }
        return JSON.stringify(updateUser);

    } catch (error) {
        console.log(error);
        throw error;
    }
}


//read
 export const getFile = async(fileId:string)=>{
    try {
        await DBconnection();
        const find = await file.findById(fileId);
        return JSON.stringify(find);
    } catch (error) {
      console.log(error);
    }
 }
//update
export const updateWhiteboardFile = async({ fileId ,whiteboard,document}:{fileId:string  , whiteboard:string,document:string})=>{
    try {
        if (!fileId || !whiteboard ) {
            throw new Error('info missing');
        }
        await DBconnection();
        const createNewFile = await file.findByIdAndUpdate({_id:fileId},{
            whiteboard: whiteboard,
            document:document,
        },
        {new :true},
        );
        return createNewFile;

    } catch (error) {
        console.log(error);
    }
}

//delete  
export const deleteFile = async ({fileId , userId}:{fileId:string,userId:string})=>{
  try {
      console.log("i hitted the server");
      if(!userId || !fileId){ 
        throw new Error("info missing");
      }
      await DBconnection();
      const updatedUser = await user.findByIdAndUpdate( userId,  { $pull: { project: { fileId: fileId }}},{ new: true }).populate("project"); 
      await file.findByIdAndDelete(fileId);
      return JSON.stringify(updatedUser);     
  } catch (error) {
      
    console.log(error);
  }
}