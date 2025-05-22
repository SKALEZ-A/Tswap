import {
  Address,
  Cell,
  OpenedContract,
  Sender,
  beginCell,
  fromNano,
  toNano,
} from "@ton/core";

import {
  Asset,
  Factory,
  JettonRoot,
  MAINNET_FACTORY_ADDR,
  PoolType,
  ReadinessStatus,
  VaultJetton,
} from "@dedust/sdk";

import { TonClient4 } from "@ton/ton";
import { SwapAggregator } from "@/contracts/SwapAggregator";
import { SwapRoot } from "@/contracts/SwapRoot";
import { swapRootAddress } from "@/contracts/constants";

export class Swap {
  static async tonToJetton(
    swapAggregator: OpenedContract<SwapAggregator>,
    sender: Sender,
    userAddress: Address | undefined,
    client: TonClient4,
    tokenAddress: string,
    amountIn: bigint,
    gas: bigint,
    slippage: number,
    deadline: number
  ) {
    if (!userAddress) {
      throw new Error("User address is undefined");
    }
    if (!(Number(amountIn) > 0)) {
      throw new Error("Amount must be greater than 0");
    }
    try {
      const TON = Asset.native();
      const TOKEN = Asset.jetton(Address.parse(tokenAddress));

      const factory = client.open(
        Factory.createFromAddress(MAINNET_FACTORY_ADDR)
      );

      const tonVault = client.open(await factory.getNativeVault());

      const TON_TOKEN_POOL = client.open(
        await factory.getPool(PoolType.VOLATILE, [TON, TOKEN])
      );

      // check if pool exists
      if (
        (await TON_TOKEN_POOL.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(`Pool (TON, ${tokenAddress}) does not exist`);
      }

      //check if vault exists
      if ((await tonVault.getReadinessStatus()) !== ReadinessStatus.READY) {
        throw new Error("Vault (TON) does not exist");
      }

      const { amountOut: expectedAmountOut } =
        await TON_TOKEN_POOL.getEstimatedSwapOut({
          assetIn: TON,
          amountIn,
        });

      // Slippage handling
      const minAmountOut = toNano(
        (Number(fromNano(expectedAmountOut)) * (100 - slippage)) / 100
      );

      // Calculate gas fee - ensure enough gas is provided
      const gasFee = Number(gas) > 0 ? gas : toNano("0.25");

      console.log("Swapping TON to Jetton:", {
        amountIn: fromNano(amountIn),
        expectedAmountOut: fromNano(expectedAmountOut),
        minAmountOut: fromNano(minAmountOut),
        gasFee: fromNano(gasFee)
      });

      return await swapAggregator.sendSwapTonToJetton(
        sender,
        amountIn + gasFee + toNano("0.05"),
        {
          amount: amountIn,
          receipientAddress: userAddress,
          poolAddress: TON_TOKEN_POOL.address,
          tonVaultAddr: tonVault.address,
          limit: minAmountOut, // Use the calculated minimum amount with slippage
          deadline,
        }
      );
    } catch (err) {
      console.error("Error in tonToJetton:", err);
      throw err;
    }
  }

  static async jettonToJetton(
    sender: Sender,
    userAddress: Address | undefined,
    userSwapAggregatorAddress: Address,
    client: TonClient4,
    tokenAddress1: string,
    tokenAddress2: string,
    amountIn: bigint,
    jettonPriceToTon: bigint,
    limit: bigint,
    deadline: number
  ) {
    if (!userAddress) return;
    if (!(Number(amountIn) > 0)) return;

    const TON = Asset.native();
    const TOKEN_1 = Asset.jetton(Address.parse(tokenAddress1));
    const TOKEN_2 = Asset.jetton(Address.parse(tokenAddress2));

    try {
      const factory = client.open(
        Factory.createFromAddress(MAINNET_FACTORY_ADDR)
      );

      const TOKEN_1_ROOT = client.open(
        JettonRoot.createFromAddress(Address.parse(tokenAddress1))
      );

      const TOKEN_1_WALLET = client.open(
        await TOKEN_1_ROOT.getWallet(userAddress)
      );

      const TON_TOKEN_1_POOL = client.open(
        await factory.getPool(PoolType.VOLATILE, [TON, TOKEN_1])
      );

      const TON_TOKEN_2_POOL = client.open(
        await factory.getPool(PoolType.VOLATILE, [TON, TOKEN_2])
      );

      const TOKEN_1_VAULT = client.open(
        await factory.getJettonVault(Address.parse(tokenAddress1))
      );

      // check if pool exists
      if (
        (await TON_TOKEN_1_POOL.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(
          `Pool (TON, ${TON_TOKEN_1_POOL.address}) does not exist`
        );
      }

      if (
        (await TON_TOKEN_2_POOL.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(
          `Pool (TON, ${TON_TOKEN_2_POOL.address}) does not exist`
        );
      }

      if (
        (await TOKEN_1_VAULT.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(`${tokenAddress1} vault does not exist`);
      }

      console.log(
        "jettonPriceToTon",
        jettonPriceToTon,
        toNano(Number(fromNano(jettonPriceToTon)) * 0.01),
        Number(fromNano(jettonPriceToTon)) * 0.01
      );

      return await TOKEN_1_WALLET.sendTransfer(
        sender,
        toNano("0.37") + toNano(Number(fromNano(jettonPriceToTon)) * 0.001),
        {
          queryId: 0,
          amount: amountIn,
          destination: userSwapAggregatorAddress,
          responseAddress: userAddress,
          customPayload: new Cell(),
          forwardAmount:
            toNano("0.33") + toNano(Number(fromNano(jettonPriceToTon)) * 0.001),
          forwardPayload: beginCell()
            .storeRef(
              VaultJetton.createSwapPayload({
                poolAddress: TON_TOKEN_1_POOL.address,
                limit,
                swapParams: { recipientAddress: userAddress },
                next: { poolAddress: TON_TOKEN_2_POOL.address },
              })
            )
            .storeCoins(jettonPriceToTon) //jetton converted to ton
            .storeAddress(
              (
                await TOKEN_1_ROOT.getWallet(userSwapAggregatorAddress)
              ).address
            )
            .storeAddress(TOKEN_1_VAULT.address)
            .endCell(),
        }
      );
    } catch (err) {
      console.log("jettonToJetton", err);
    }
  }

  static async jettonToTon(
    sender: Sender,
    userAddress: Address | undefined,
    userSwapAggregatorAddress: Address,
    client: TonClient4,
    tokenAddress: string,
    amountIn: bigint,
    jettonPriceToTon: bigint,
    slippage: number,
    deadline: number
  ) {
    if (!userAddress) {
      throw new Error("User address is undefined");
    }
    if (!(Number(amountIn) > 0)) {
      throw new Error("Amount must be greater than 0");
    }

    const TON = Asset.native();
    const TOKEN = Asset.jetton(Address.parse(tokenAddress));

    try {
      const factory = client.open(
        Factory.createFromAddress(MAINNET_FACTORY_ADDR)
      );

      const TOKEN_1_ROOT = client.open(
        JettonRoot.createFromAddress(Address.parse(tokenAddress))
      );

      const TOKEN_1_WALLET = client.open(
        await TOKEN_1_ROOT.getWallet(userAddress)
      );

      const TON_TOKEN_1_POOL = client.open(
        await factory.getPool(PoolType.VOLATILE, [TON, TOKEN])
      );

      const TOKEN_1_VAULT = client.open(
        await factory.getJettonVault(Address.parse(tokenAddress))
      );

      // check if pool exists
      if (
        (await TON_TOKEN_1_POOL.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(
          `Pool (TON, ${tokenAddress}) does not exist`
        );
      }
      if (
        (await TOKEN_1_VAULT.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(`${tokenAddress} vault does not exist`);
      }

      // Estimate the amount of TON to receive
      const { amountOut: expectedAmountOut } =
        await TON_TOKEN_1_POOL.getEstimatedSwapOut({
          assetIn: TOKEN,
          amountIn,
        });

      // Calculate minimum amount out with slippage
      const minAmountOut = toNano(
        (Number(fromNano(expectedAmountOut)) * (100 - slippage)) / 100
      );
      
      // Calculate gas fees based on transaction size
      const baseFee = toNano("0.37");
      const additionalFee = toNano(Number(fromNano(jettonPriceToTon)) * 0.001);
      const forwardFee = toNano("0.33") + toNano(Number(fromNano(jettonPriceToTon)) * 0.001);
      
      console.log("Swapping Jetton to TON:", {
        tokenAddress,
        amountIn: fromNano(amountIn),
        expectedAmountOut: fromNano(expectedAmountOut),
        minAmountOut: fromNano(minAmountOut),
        totalFee: fromNano(baseFee + additionalFee)
      });
      
      return await TOKEN_1_WALLET.sendTransfer(
        sender,
        baseFee + additionalFee,
        {
          queryId: 0,
          amount: amountIn,
          destination: userSwapAggregatorAddress,
          responseAddress: userAddress,
          customPayload: new Cell(),
          forwardAmount: forwardFee,
          forwardPayload: beginCell()
            .storeRef(
              VaultJetton.createSwapPayload({
                poolAddress: TON_TOKEN_1_POOL.address,
                limit: minAmountOut,
                swapParams: { recipientAddress: userAddress },
              })
            )
            .storeCoins(jettonPriceToTon) // jetton converted to ton
            .storeAddress(
              (
                await TOKEN_1_ROOT.getWallet(userSwapAggregatorAddress)
              ).address
            )
            .storeAddress(TOKEN_1_VAULT.address)
            .endCell(),
        }
      );
    } catch (err) {
      console.error("Error in jettonToTon:", err);
      throw err;
    }
  }

  static async withDrawExcessTon(
    swapAggregator: OpenedContract<SwapAggregator>,
    sender: Sender,
    amount: bigint
  ) {
    try {
      return await swapAggregator.sendWithdrawExcessTon(
        sender,
        toNano("0.02"),
        amount
      );
    } catch (err) {
      console.log("withDrawTon", err.message);
    }
  }

  static async withdrawUserJetton(
    provider: TonClient4,
    sender: Sender,
    address: Address
  ) {
    const root = Address.parse(
      "EQAQXlWJvGbbFfE8F3oS8s87lIgdovS455IsWFaRdmJetTon"
    );

    const swapRoot = provider.open(SwapRoot.createFromAddress(swapRootAddress));

    try {
      const userAggregatorAddress = await swapRoot.getUserAggregatorAddress(
        address
      );

      const swapAggregator = provider.open(
        SwapAggregator.createFromAddress(userAggregatorAddress)
      );

      const scaleRoot = provider.open(JettonRoot.createFromAddress(root));

      const userAggregatorJettonAddr = await scaleRoot.getWallet(
        userAggregatorAddress
      );

      console.log("userAggregatorJettonAddr", userAggregatorJettonAddr);

      await swapAggregator.sendWithdrawJetton(sender, toNano("0.05"), {
        jettonAmount: toNano("6"),
        userAggregatorJettonAddress: userAggregatorJettonAddr.address,
      });
    } catch (err) {
      console.log("withdraw jetton", err);
    }
  }
}
