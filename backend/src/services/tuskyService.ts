import {Tusky} from '@tusky-io/ts-sdk';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { randomBytes } from 'crypto';

// Load environment variables
dotenv.config();

class TuskyService {
  private tusky: any;

  constructor() {
    this.tusky = new Tusky({
      apiKey: process.env.TUSKY_API_KEY,
    });
  }

  async uploadDocumentToVault(
    vaultId: string,
    fileInput: Buffer | string,
    filename: string,
  ) {
    let tempFilePath: string | undefined = undefined;
    try {
      if (!vaultId) {
        throw new Error('Vault ID must be provided');
      }
      if (!filename) {
        throw new Error('Filename must be provided for upload');
      }

      let uploadPath: string;

      if (typeof fileInput === 'string') {
        uploadPath = fileInput;
      } else if (fileInput instanceof Buffer) {
        const tempDir = os.tmpdir();
        tempFilePath = path.join(tempDir, path.basename(filename) || randomBytes(16).toString('hex'));
        fs.writeFileSync(tempFilePath, fileInput);
        uploadPath = tempFilePath;
      } else {
        throw new Error('Invalid file input type. Must be a string (path) or Buffer.');
      }

      console.log(`Uploading ${filename} to vault ${vaultId} from path ${uploadPath}`);
      const uploadId = await this.tusky.file.upload(vaultId, uploadPath);
      console.log(`File ${filename} uploaded with ID: ${uploadId}`);

      return uploadId;
    } catch (error) {
      console.error("Error in uploadDocumentToVault:", error);
      throw error;
    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
          console.log(`Cleaned up temporary file: ${tempFilePath}`);
        } catch (cleanupError) {
          console.error(`Error cleaning up temporary file ${tempFilePath}:`, cleanupError);
        }
      }
    }
  }

  async getFileMetadata(uploadId: string) {
    try {
      console.log(`Getting file metadata for upload ID: ${uploadId}`);
      const fileMetadata = await this.tusky.file.get(uploadId);
      return fileMetadata;
    } catch (error) {
      console.error("Error in getFileMetadata:", error);
      throw error;
    }
  }

  async downloadFile(uploadId: string) {
    try {
      console.log(`Downloading file with upload ID: ${uploadId}`);
      const fileBuffer = await this.tusky.file.arrayBuffer(uploadId);
      return fileBuffer;
    } catch (error) {
      console.error("Error in downloadFile:", error);
      throw error;
    }
  }
}

// Export the service
export const tuskyService = new TuskyService();