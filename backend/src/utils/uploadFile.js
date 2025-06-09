import {google} from "googleapis"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()


const keyFile = JSON.parse(
    Buffer.from(process.env.GOOGLE_DRIVE_SERVICE_KEY, "base64").toString()
);
const auth = new google.auth.GoogleAuth({
    credentials: keyFile,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const uploadFileToGoogleDrive = async (filePath) => {

    try {
        if (!filePath) {
            throw new Error('File path is required');
        }
        const drive = await google.drive({ version: 'v3', auth })

        // upload file to Google Drive

        const fileMetadata = {
            name: filePath.split('/').pop(), 
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID] // Folder ID to upload the file into
        };

        const media = {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(filePath) // Readable stream for file upload
        };


        const driveResponse = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });
        const fileId = driveResponse.data.id;
        const Url = `https://drive.google.com/file/d/${fileId}/preview`;
       
        console.log('File uploaded successfully. File ID:', driveResponse.data.id);
        return  Url ;
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        throw error;
    }
}

export default uploadFileToGoogleDrive