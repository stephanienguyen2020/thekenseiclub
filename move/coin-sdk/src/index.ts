import CoinSDK from "./coin";
import {getClient} from "../sui-utils";
import BondingCurveSDK from "./bonding_curve";

const address="0x89052a175017eb52f49d24e7de1f48b0c38c6b1d67f9fc4e471420524e4dc2d4"
const treasuryCap = "0xd5a8f35f3f4abc206e5d97a21b1bc6c5845464386f0abc4a8903173a66e2564f"
const client = getClient("localnet");
const coinCreationPackageId = "0xb99fae772e06a49ef626d4122b40c571c13a858033f1b1ade71a94149a3b9189"
const coinMetadata = "0x336864ff9f4a86311489da15082f3092c2c1cb2c8412cd19e924ee147e63f71e"
const coinSdk = new CoinSDK(treasuryCap, client, coinCreationPackageId, coinMetadata);
const coinType = "0xdb9147361372acaece6d3c452122ee0d29c5abac9f4628ba695ea0b0e608f14b::keke::KEKE";

const suiCoinId="0x99a122a72ed9c1130b5f9583ee7357f4784c898b9e732ddac96f59283cf0fae4"
const suiCoinType = "0x2::coin::Coin<0x2::sui::SUI>";

const bondingCurvePackageId = "0x81d7ca09e6d2cc04a27be4508355690cab345665440538fe7bac0b583cb79db0";
const bondingCurveObjectId = "0x8c2ccf778d8afe14740175073632b1d6b6d2067705cb9b8801e3b9e740d7d3a2"

//Publish new coin
// CoinSDK.deployNewCoin({
//     name: "keke",
//     symbol: "keke",
//     description: "keke",
//     iconUrl: "https://cdn.oneesports.vn/cdn-data/sites/4/2023/05/TuSena-ManU-1024x576.jpg",
//     client,
//     address
// });

//Mint and transfer coin
// coinSdk.createCoinAndTransfer({
//     amount: 10000000000,
//     recipient: address,
//     address
// });

//Create bonding curve
// BondingCurveSDK.createBondingCurve(treasuryCap, coinMetadata, 10000000000000000000, client, bondingCurvePackageId, coinType, address);

// Buy, sell bonding curve
const bondingCurveSdk = new BondingCurveSDK(bondingCurveObjectId, client, bondingCurvePackageId);
bondingCurveSdk.buy({
    amount: 1000000000,
    minTokenRequired: 0,
    coinId: suiCoinId,
    type: coinType,
    address: address
})

// bondingCurveSdk.sell({
//     amount: 100000000000000000,
//     minSuiRequired: 0,
//     coinId: tokenId,
//     type: tokenType,
//     address: address
// })


export { CoinSDK };
