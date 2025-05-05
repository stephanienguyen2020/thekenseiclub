import {ACTIVE_NETWORK, getClient, getWalrusClient} from "../utils";
import {getFundedKeypair} from "../funded-keypair";

class FileService {
  suiClient = getClient();
  walrusClient = getWalrusClient(ACTIVE_NETWORK, this.suiClient);

  async writeWalrusBlob(buffer: Buffer) {
    const keypair = await getFundedKeypair();

    // Upload to Walrus
    return await this.walrusClient.writeBlob({
      blob: buffer,
      deletable: false,
      epochs: 3,
      signer: keypair,
    });

  }

  async getWalrusBuffer(blobId: string) {
    // Retrieve blob data
    const blobBytes = await this.walrusClient.readBlob({blobId});

    // Convert to Blob object
    const blob = new Blob([new Uint8Array(blobBytes)]);

    // Convert blob to buffer for response
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

export const fileService = new FileService();
