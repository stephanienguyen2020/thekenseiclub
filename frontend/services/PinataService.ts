import axios from "axios";
import { PINATA_CONFIG } from "../config/pinata";

/**
 * Service for interacting with Pinata IPFS
 */
export const usePinataService = () => {
  /**
   * Uploads a file to IPFS via Pinata
   * @param file - The file to upload
   * @returns A promise that resolves to the IPFS URL
   */
  const uploadToIPFS = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading file to IPFS:", file.name);
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: PINATA_CONFIG.API_KEY,
            pinata_secret_api_key: PINATA_CONFIG.SECRET_KEY,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `${PINATA_CONFIG.GATEWAY_URL}/${ipfsHash}`;
      console.log("File uploaded to IPFS:", ipfsUrl);
      return ipfsUrl;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw new Error("Failed to upload image to IPFS");
    }
  };

  /**
   * Uploads a JSON object to IPFS via Pinata
   * @param jsonData - The JSON data to upload
   * @returns A promise that resolves to the IPFS URL
   */
  const uploadJSONToIPFS = async (jsonData: object): Promise<string> => {
    try {
      console.log("Uploading JSON to IPFS");
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        jsonData,
        {
          headers: {
            pinata_api_key: PINATA_CONFIG.API_KEY,
            pinata_secret_api_key: PINATA_CONFIG.SECRET_KEY,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `${PINATA_CONFIG.GATEWAY_URL}/${ipfsHash}`;
      console.log("JSON uploaded to IPFS:", ipfsUrl);
      return ipfsUrl;
    } catch (error) {
      console.error("Error uploading JSON to IPFS:", error);
      throw new Error("Failed to upload JSON to IPFS");
    }
  };

  return {
    uploadToIPFS,
    uploadJSONToIPFS,
  };
};
